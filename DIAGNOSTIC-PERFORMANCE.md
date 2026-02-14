# Diagnostic de Performance - AUTOLOCO

## Analyse du temps de recuperation des donnees depuis la base de donnees vers l'interface utilisateur

Date : Fevrier 2026 (mise a jour v2)

---

## 1. Architecture actuelle

L'application AUTOLOCO utilise une architecture hybride en couches :

```
[Frontend Next.js 16]
  |
  |--> [API Routes Next.js] ---> [Prisma ORM (fallback / direct)] ---> [SQL Server]
  |                          \
  |                           `-> [fetch() vers FastAPI Python] --> [SQLAlchemy (pyodbc sync)] --> [SQL Server]
  |
  `--> [SWR (client-side data fetching)]
```

- **Frontend** : Next.js 16 avec React 18, pages 100% client-side (`"use client"`) avec SWR
- **Couche API** : API Routes Next.js (`/app/api/`) qui tentent d'abord FastAPI puis Prisma en fallback
- **Backend Python** : FastAPI avec SQLAlchemy (wrapper sync-to-async via `run_in_threadpool`)
- **Base de donnees** : SQL Server avec Prisma (`@prisma/client` 5.22.0) et `pyodbc` (synchrone)
- **Cache** : Redis prevu (`backend/app/core/cache.py`) mais non utilise dans les routes actives

---

## 2. Problemes identifies et causes de lenteur

### 2.1. Double couche de proxy (latence reseau accumulee) - CRITIQUE

**Probleme** : Chaque requete frontend traverse DEUX serveurs avant d'atteindre la BDD.

Le fichier `app/api/vehicles/route.ts` montre clairement ce pattern :
```typescript
const response = await backendApi.getVehicles(params)  // -> fetch("http://localhost:8000/api/v1/vehicles")

if (response.error) {
  // Fallback Prisma seulement si FastAPI echoue
  const [total, items] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({ where, include, orderBy, skip, take })
  ])
}
```

Le module `lib/api/backend.ts` effectue un `fetch()` HTTP vers `http://localhost:8000`, ajoutant :
- Serialisation JSON cote FastAPI
- Transfer HTTP (meme en local, overhead TCP/JSON)
- Deserialisation JSON cote Next.js
- Re-serialisation JSON vers le navigateur

**Verification** : Le pattern est identique dans `app/api/search/route.ts`, `app/api/bookings/route.ts`, etc.

**Impact** : +50-200ms de latence supplementaire par requete. L'ironie est que le fallback Prisma (chemin direct) est deja fonctionnel et plus rapide.

---

### 2.2. Wrapper async fictif sur driver synchrone - CRITIQUE

**Probleme** : Le fichier `backend/app/core/database.py` utilise un driver pyodbc **synchrone** enveloppe dans `run_in_threadpool` :

```python
class AsyncSessionSyncWrapper:
    async def execute(self, *args, **kwargs):
        return await run_in_threadpool(self._session.execute, *args, **kwargs)
```

Chaque operation de BDD cree un thread OS supplementaire. Avec le pool par defaut (`DB_POOL_SIZE` connexions + `DB_MAX_OVERFLOW`) et des requetes concurrentes, le threadpool devient un goulot d'etranglement. Ce n'est pas du vrai async : le thread est bloque pendant l'execution SQL.

**Impact** : Throughput reduit de 30-50% par rapport a un driver veritablement async. Sous charge, risque de thread starvation.

---

### 2.3. Probleme N+1 et eager loading inconsistant - MAJEUR

**Probleme** : L'eager loading est present sur certains endpoints (le fallback Prisma dans `vehicles/route.ts` inclut `categorie`, `modele.marque`, `photos`) mais absent sur d'autres endpoints critiques.

Cote backend Python, dans `vehicles.py` :
```python
# Pas d'eager loading : genere N+1
result = await db.execute(select(Vehicule).where(Vehicule.IdentifiantVehicule == vehicle_id))
vehicle = result.scalar_one_or_none()

# Puis une SECONDE requete pour les images
images_result = await db.execute(
    select(ImageVehicule).where(ImageVehicule.IdentifiantVehicule == vehicle_id)
)
```

**Impact** : 2 a N+1 requetes au lieu de 1, multipliant la latence par le nombre de relations non chargees.

---

### 2.4. Double requete COUNT + SELECT (pagination) - MODERE

**Probleme** : Le fallback Prisma dans `app/api/vehicles/route.ts` execute deux requetes en parallele (`Promise.all`), ce qui est acceptable. Mais cote FastAPI, les endpoints pagines executent deux requetes **sequentiellement** :

```python
count_query = select(func.count()).select_from(query.subquery())
total = await db.scalar(count_query)

result = await db.execute(query.offset(offset).limit(page_size))
```

La sous-requete `count()` re-execute entierement les filtres et les JOINs.

**Impact** : +100-500ms supplementaires par page listee (cote FastAPI). Le chemin Prisma est mieux optimise grace au `Promise.all`.

---

### 2.5. Filtrage client-side redondant - MODERE

**Probleme** : Le fichier `app/vehicles/page.tsx` effectue un double filtrage :

1. Le hook `useVehicles` envoie les filtres (`type`, `city`, `fuel`, `transmission`, `minPrice`, `maxPrice`) a l'API
2. Le `useMemo` re-applique TOUS ces filtres + des filtres supplementaires (`seats`, `features`, `instantBooking`, `verified`, `searchQuery`) cote client

```typescript
// Hook envoie les filtres au serveur
const { vehicles } = useVehicles({
  type: filters.type !== "all" ? filters.type : undefined,
  city: filters.city !== "all" ? filters.city : undefined,
  // ... mais PAS seats, features, instantBooking, verified, searchQuery, sortBy
})

// Puis re-filtre TOUT cote client
const filteredVehicles = React.useMemo(() => {
  let result = [...(vehicles || [])]
  if (searchQuery) { result = result.filter(...) }
  if (filters.type !== "all") { result = result.filter(...) }  // DEJA FAIT serveur !
  if (filters.city !== "all") { result = result.filter(...) }  // DEJA FAIT serveur !
  // ... + filtres JAMAIS envoyes au serveur : seats, features, verified
  switch (sortBy) { ... }  // Tri uniquement cote client
}, [vehicles, searchQuery, sortBy])
```

**Problemes specifiques** :
- `searchQuery` n'est pas envoye au hook (filtre seulement en local sur les 20 resultats de la page)
- `sortBy` (prix, note, avis) est fait uniquement cote client au lieu de SQL `ORDER BY`
- `seats`, `features`, `verified`, `instantBooking` sont filtres localement mais pas envoyes au serveur
- Le compteur affiche `filteredVehicles.length` (locaux) au lieu de `total` (serveur), donnant un chiffre faux
- Pas de vraie pagination serveur : la page ne charge que `page_size=20` et filtre dessus

**Impact** : Resultats incomplets (filtre sur 20 au lieu de tout), tri incoherent, UX trompeuse.

---

### 2.6. Absence totale de cache sur les chemins actifs - MAJEUR

**Probleme** : Bien que `backend/app/core/cache.py` definisse un systeme Redis complet avec des TTL (SHORT 60s, MEDIUM 300s, LONG 1800s, VERY_LONG 3600s), **aucun endpoint actif ne l'utilise**.

- Aucun header `Cache-Control` sur les API Routes Next.js
- Aucune directive `'use cache'` de Next.js 16
- Le rate limiter cote Next.js utilise un `Map` en memoire (pas Redis)
- SWR a un `dedupingInterval: 10000` (10s), c'est le seul "cache" actif (navigateur uniquement)
- Les endpoints comme `/api/public/featured-vehicles` et `/api/public/stats` retournent des donnees quasi-statiques mais sont re-requetees a chaque visite

**Verification** : `featured-vehicles/route.ts` fait un `prisma.vehicle.findMany(...)` direct sans cache, alors que ces donnees changent rarement.

**Impact** : Chaque visite genere des requetes identiques vers la BDD. Sur 1000 visites/heure, cela fait 1000 requetes identiques pour les vehicules vedettes.

---

### 2.7. Dashboard admin : 10 requetes Prisma paralleles - MODERE

**Probleme** : Le fichier `app/api/admin/dashboard/route.ts` execute 10 requetes Prisma en un seul `Promise.all` :

```typescript
const [recentUsers, recentReservations, recentVehicles, pendingVehicles,
       totalActiveVehicles, totalVehicles, totalVerifiedUsers, totalUsers,
       avgRating, totalReviews] = await Promise.all([
  prisma.user.findMany({ orderBy: { DateInscription: "desc" }, take: 2 }),
  prisma.reservation.findMany({ orderBy: { DateCreationReservation: "desc" }, take: 2 }),
  prisma.vehicle.findMany({ where: { StatutVerification: "EnAttente" }, take: 5 }),
  // ... + 6 count/aggregate queries
])
```

Le `Promise.all` est une bonne pratique pour la parallelisation, mais :
- 10 requetes simultanees saturent le pool de connexions Prisma
- Les `count()` individuels pourraient etre combines en une seule requete SQL `SELECT COUNT(CASE WHEN ...)`
- Ces metriques sont stables sur des periodes de 5-15 minutes, ideales pour le cache

**Impact** : 500ms-2s pour le dashboard admin, pool de connexions Prisma stresse.

---

### 2.8. Dashboard Owner : calculs JS au lieu de SQL - MODERE

**Probleme** : Le fichier `app/api/dashboard/owner/overview/route.ts` charge les vehicules et reservations, puis effectue des calculs lourds en JavaScript :

```typescript
const [vehicles, recentReservations] = await Promise.all([
    prisma.vehicle.findMany({ where: { proprietaireId: localUserId } }),
    prisma.reservation.findMany({ where: { proprietaireId: localUserId }, take: 10,
      select: { ... transactions: { take: 1, ... } }
    }),
])

// Puis en JS : filtrage par mois, calcul de revenus, taux d'occupation, performance vehicule
const monthRevenue = monthReservations.reduce((sum, r) => { ... }, 0)
```

Les calculs de revenus (`SUM`), taux d'occupation, et performance par vehicule sont faits en JS au lieu de `SUM()`, `AVG()`, `GROUP BY` en SQL.

**Impact** : Transfert de donnees excessif entre BDD et serveur, calculs O(n^2) en JS pour les performances vehicule.

---

### 2.9. Index composes partiellement implementes - MODERE

**Constat positif** : Le schema Prisma definit deja de bons index, y compris des composites :
- `IX_Vehicules_Search_Composite(StatutVehicule, EstVedette, NotesVehicule)`
- `IX_Vehicules_Owner_Statut(proprietaireId, StatutVehicule)`
- `IX_Reservations_Owner_Dates(proprietaireId, DateDebut, DateFin)`
- `IX_Reservations_Availability(vehiculeId, StatutReservation, DateDebut, DateFin)`
- `IX_Transactions_Analytics(StatutTransaction, DateTransaction)`

**Probleme** : Ces index existent mais ne sont pas **couvrants** (pas de `INCLUDE`). SQL Server doit effectuer des Key Lookups pour recuperer les colonnes non incluses dans l'index.

**Index couvrants recommandes** (complement a l'existant) :
```sql
-- Ameliore IX_Vehicules_Search_Composite avec INCLUDE pour eviter les Key Lookups
CREATE INDEX IX_Vehicules_Search_Covering ON Vehicules(StatutVehicule, EstVedette DESC, NotesVehicule DESC)
    INCLUDE (TitreAnnonce, PrixJournalier, LocalisationVille, TypeCarburant, TypeTransmission, NombrePlaces, Annee);

-- Ameliore IX_Transactions_Analytics avec INCLUDE
CREATE INDEX IX_Transactions_Analytics_Covering ON Transactions(StatutTransaction, DateTransaction DESC)
    INCLUDE (Montant, TypeTransaction, MethodePaiement, FraisCommission, MontantNet);
```

**Impact** : Sans index couvrant, chaque Key Lookup ajoute un I/O aleatoire par ligne, degradant les performances sur les requetes paginees.

---

### 2.10. Toutes les pages dashboard sont full client-side - MODERE

**Probleme** : 100% des pages dashboard (29 fichiers identifies) sont marquees `"use client"`. Le flow est :

1. Next.js envoie un HTML vide (skeleton/loader)
2. Le navigateur telecharge et execute le bundle JS
3. SWR lance un `fetch()` vers `/api/dashboard/...`
4. L'API Route interroge Prisma ou FastAPI
5. Les donnees transitent : BDD -> API Route -> Navigateur -> Rendu

Avec des React Server Components (RSC), le flow serait :
1. Next.js fetch les donnees directement via Prisma (meme processus, zero latence reseau)
2. Le HTML pre-rendu est envoye en streaming au navigateur

**Impact** : +500ms-2s de temps percu (Time to First Meaningful Paint) pour chaque page dashboard.

---

### 2.11. Prisma Client avec logging "query" en production - FAIBLE

**Probleme** : Le fichier `lib/prisma.ts` (ou `lib/db/prisma-client.ts`) configure :
```typescript
new PrismaClient({
  log: ["query", "error", "warn"],
})
```

Le log `"query"` genere une entree de journal pour chaque requete SQL executee, meme en production. Cela ajoute une surcharge I/O de logging et consomme de la memoire pour les messages de log.

**Impact** : +5-20ms par requete en overhead de logging. Negligeable unitairement mais cumulatif.

---

### 2.12. Absence de pagination serveur dans le hook useVehicles - MODERE

**Probleme** : Le hook `useVehicles` dans `hooks/use-vehicles.ts` ne transmet pas le parametre `page` :

```typescript
export function useVehicles(filters?: { type?, city?, fuel?, ... }, options?) {
  // Pas de parametre page/page_size dans les filtres
  const { data } = useSWR(queryKey, async () => {
    const response = await vehicleService.searchVehicles(filters) // page=1 par defaut
    return response.data
  })
}
```

La page `vehicles/page.tsx` n'a pas de composant de pagination et n'envoie jamais de page > 1. L'utilisateur ne voit que les 20 premiers resultats.

**Impact** : UX incomplete, l'utilisateur ne peut pas naviguer au-dela des 20 premiers vehicules.

---

## 3. Strategies d'amelioration recommandees

### 3.1. Priorite HAUTE : Utiliser Prisma directement (eliminer le proxy FastAPI pour les lectures)

**Solution** : Le fallback Prisma dans `app/api/vehicles/route.ts` fonctionne deja. Le rendre primaire :

```typescript
// AVANT : try backend first, fallback to Prisma
const response = await backendApi.getVehicles(params)
if (response.error) { /* use Prisma */ }

// APRES : Prisma direct pour les lectures
const [total, items] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({ where, include, orderBy, skip, take })
])
```

Garder FastAPI uniquement pour les operations d'ecriture complexes et la logique metier qui le justifie.

**Gain estime** : -50-200ms par requete de lecture.

---

### 3.2. Priorite HAUTE : Implementer le cache multi-niveaux

**Niveau 1 - Cache HTTP (API Routes) :**
```typescript
return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
})
```

**Niveau 2 - `use cache` de Next.js 16 pour les donnees quasi-statiques :**
```tsx
async function FeaturedVehicles() {
    'use cache'
    const vehicles = await prisma.vehicle.findMany({ where: { StatutVehicule: "Actif" }, ... })
    return <VehicleGrid vehicles={vehicles} />
}
```

**Niveau 3 - Cache in-memory simple pour les metriques admin :**
```typescript
const METRICS_CACHE = new Map<string, { data: any; expires: number }>()

async function getCachedMetrics(key: string, ttlMs: number, fetcher: () => Promise<any>) {
    const cached = METRICS_CACHE.get(key)
    if (cached && Date.now() < cached.expires) return cached.data
    const data = await fetcher()
    METRICS_CACHE.set(key, { data, expires: Date.now() + ttlMs })
    return data
}
```

**Gain estime** : Reduction de 80-95% des requetes BDD pour les donnees quasi-statiques.

---

### 3.3. Priorite HAUTE : Corriger le double filtrage et ajouter la pagination serveur

**Solution** :
1. Transmettre TOUS les filtres au hook `useVehicles` (incluant `search`, `sortBy`, `seats`, `page`)
2. Supprimer le `useMemo` de re-filtrage dans `vehicles/page.tsx`
3. Ajouter un composant de pagination avec `page` et `page_size` envoyes au serveur
4. Ajouter un `orderBy` serveur base sur `sortBy`

```typescript
const { vehicles, total, isLoading } = useVehicles({
    type: filters.type !== "all" ? filters.type : undefined,
    city: filters.city !== "all" ? filters.city : undefined,
    search: searchQuery || undefined,
    sortBy,
    seats: filters.seats.length > 0 ? Math.min(...filters.seats) : undefined,
    page: currentPage,
    page_size: 20,
})
// Supprimer filteredVehicles useMemo
```

**Gain estime** : Resultats corrects, pagination fonctionnelle, -50ms CPU client.

---

### 3.4. Priorite MOYENNE : Migrer les dashboards critiques vers RSC

Convertir les pages dashboard les plus visitees (owner overview, admin dashboard, renter overview) :

```tsx
// AVANT (client-side)
"use client"
export default function OwnerDashboard() {
    const { data } = useSWR('/api/dashboard/owner/overview')
    if (!data) return <Skeleton />
    return <Dashboard data={data} />
}

// APRES (server component + client islands)
export default async function OwnerDashboard() {
    const data = await getOwnerOverview()  // appel Prisma direct
    return <DashboardClient initialData={data} />
}
```

**Gain estime** : -500ms-2s sur le Time to First Meaningful Paint.

---

### 3.5. Priorite MOYENNE : Optimiser les requetes analytics avec SQL

Remplacer les calculs JS par des requetes SQL agregees :

```typescript
// AVANT : charge toutes les reservations puis calcule en JS
const reservations = await prisma.reservation.findMany({ where: { proprietaireId } })
const revenue = reservations.reduce((sum, r) => sum + Number(r.MontantTotal), 0)

// APRES : calcul SQL direct
const stats = await prisma.reservation.aggregate({
    where: { proprietaireId, DateDebut: { gte: monthStart }, DateFin: { lte: monthEnd } },
    _sum: { MontantTotal: true },
    _count: true,
})
```

**Gain estime** : -60-80% de donnees transferees, -70% de temps de calcul.

---

### 3.6. Priorite MOYENNE : Ajouter les index couvrants manquants

```sql
-- Couvre la requete de liste vehicules principale sans Key Lookup
CREATE INDEX IX_Vehicules_Search_Covering ON Vehicules(StatutVehicule, EstVedette DESC, NotesVehicule DESC)
    INCLUDE (TitreAnnonce, PrixJournalier, LocalisationVille, TypeCarburant, TypeTransmission, NombrePlaces, Annee);

-- Couvre les requetes analytics de transactions
CREATE INDEX IX_Transactions_Analytics_Covering ON Transactions(StatutTransaction, DateTransaction DESC)
    INCLUDE (Montant, TypeTransaction, MethodePaiement, FraisCommission, MontantNet);

-- Couvre le dashboard owner
CREATE INDEX IX_Reservations_Owner_Covering ON Reservations(IdentifiantProprietaire, DateDebut, DateFin)
    INCLUDE (MontantTotal, StatutReservation, IdentifiantVehicule);
```

**Gain estime** : -30-80% de temps sur les requetes paginées et analytiques.

---

### 3.7. Priorite BASSE : Desactiver le log "query" de Prisma en production

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})
```

---

### 3.8. Priorite BASSE : Driver async natif (long terme)

Remplacer pyodbc (sync) par un driver veritablement async (`aioodbc`) ou migrer vers PostgreSQL avec `asyncpg` pour un gain de performance significatif sous charge. Ceci est pertinent uniquement si FastAPI reste utilise pour des operations critiques.

---

## 4. Resume de l'impact estime

| # | Probleme | Severite | Impact latence | Difficulte |
|---|---|---|---|---|
| 2.1 | Double proxy (Next.js -> FastAPI -> SQL) | Critique | +50-200ms/req | Moyenne |
| 2.2 | Wrapper sync-to-async (pyodbc + threadpool) | Critique | -30-50% throughput | Elevee |
| 2.3 | N+1 / eager loading manquant (cote FastAPI) | Majeur | +100-500ms/page detail | Faible |
| 2.4 | Double requete COUNT + SELECT sequentielle (FastAPI) | Modere | +100-500ms chaque page | Faible |
| 2.5 | Double filtrage frontend + serveur + filtres incomplets | Modere | Resultats faux + CPU client | Faible |
| 2.6 | Absence totale de cache (HTTP, Redis, `use cache`) | Majeur | x2-10 req identiques | Moyenne |
| 2.7 | Dashboard admin : 10 requetes paralleles non cachees | Modere | 500ms-2s dashboard | Moyenne |
| 2.8 | Dashboard owner : calculs JS au lieu de SQL | Modere | Transfert excessif BDD->JS | Moyenne |
| 2.9 | Index composes sans INCLUDE (Key Lookups) | Modere | +50-2000ms selon volume | Faible |
| 2.10 | 29 pages dashboard full client-side (pas de RSC) | Modere | +500ms-2s TTFMP | Moyenne |
| 2.11 | Prisma log "query" actif en production | Faible | +5-20ms/req cumulatif | Triviale |
| 2.12 | Pas de pagination serveur dans useVehicles | Modere | UX incomplete | Faible |

---

## 5. Plan d'action recommande

### Phase 1 - Gains rapides (1-2 jours)
1. Rendre Prisma primaire pour les lectures (eliminer proxy FastAPI)
2. Ajouter `Cache-Control` sur les endpoints publics (`featured-vehicles`, `stats`, `testimonials`)
3. Corriger le double filtrage dans `vehicles/page.tsx` et ajouter la pagination serveur
4. Desactiver le log `"query"` de Prisma en production

### Phase 2 - Gains majeurs (3-5 jours)
5. Implementer `'use cache'` de Next.js 16 pour les donnees quasi-statiques
6. Migrer les 3 dashboards principaux vers RSC (owner, admin, renter overview)
7. Remplacer les calculs JS du dashboard owner par des `aggregate()` Prisma
8. Ajouter les index couvrants SQL Server

### Phase 3 - Optimisation avancee (5-10 jours)
9. Implementer un cache in-memory ou Redis pour les metriques admin
10. Combiner les 10 requetes du dashboard admin en requetes SQL agregees
11. Migrer vers un driver async natif ou PostgreSQL (si FastAPI est conserve)
12. Ajouter des vues materialisees / tables de pre-agregation pour les analytics

---

## 6. Diagramme du flux actuel vs optimise

### Flux actuel (pire cas : ~800ms-3s)
```
Navigateur --[1. HTML vide]--> parse JS --[2. SWR fetch]--> Next.js API Route
  --[3. fetch() HTTP]--> FastAPI Python --[4. pyodbc sync + threadpool]--> SQL Server
  --[5. JSON response]--> FastAPI --[6. JSON response]--> Next.js API
  --[7. JSON response]--> Navigateur --[8. Re-filtrage JS]--> Rendu
```

### Flux optimise (cible : ~100-300ms)
```
Navigateur --[1. requete HTTP]--> Next.js RSC
  --[2. Prisma direct]--> SQL Server (index couvrants + cache)
  --[3. HTML streame]--> Navigateur (rendu immediat)
```
