# Guide de Test Rapide - Sécurité AUTOLOCO

## Tests de 5 Minutes

Ces tests permettent de valider rapidement que toutes les corrections de sécurité fonctionnent.

---

## Test 1: Rate Limiting (2 min)

### Avec le navigateur
1. Ouvrir `/auth/login`
2. Essayer de se connecter 6 fois avec un mauvais mot de passe
3. **Résultat attendu**: Message "Trop de requêtes" après la 5ème tentative

### Avec curl
\`\`\`bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
\`\`\`

**Résultat attendu**:
- Tentatives 1-5: Status 401
- Tentative 6: Status 429

---

## Test 2: Messages Génériques (1 min)

### Test email inexistant vs mot de passe incorrect

\`\`\`bash
# Email inexistant
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"inexistant@test.com","password":"test"}'

# Email existant, mauvais mot de passe  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autoloco.com","password":"wrong"}'
\`\`\`

**Résultat attendu**: Les deux retournent exactement le même message: `{"error":"Identifiants invalides"}`

---

## Test 3: Permissions (2 min)

### Prérequis
- Se connecter avec 2 comptes différents (locataires A et B)
- Noter les cookies de session

### Test
\`\`\`bash
# Créer une réservation avec le locataire A
TOKEN_A="<cookie-locataire-a>"
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$TOKEN_A" \
  -d '{
    "vehicule_id": "123",
    "date_debut": "2026-02-01",
    "date_fin": "2026-02-05"
  }'

# Noter l'ID de la réservation créée
BOOKING_ID="<id-retourné>"

# Essayer d'y accéder avec le locataire B
TOKEN_B="<cookie-locataire-b>"
curl http://localhost:3000/api/bookings/$BOOKING_ID \
  -H "Cookie: next-auth.session-token=$TOKEN_B"
\`\`\`

**Résultat attendu**: `{"error":"Réservation non accessible"}` avec status 404

---

## Test 4: Headers de Sécurité (30 sec)

\`\`\`bash
curl -I http://localhost:3000/
\`\`\`

**Résultat attendu**: Présence de ces headers
\`\`\`
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: ...
Referrer-Policy: strict-origin-when-cross-origin
\`\`\`

---

## Test 5: Audit Logs (1 min)

### Prérequis
- Se connecter en tant qu'admin

### Test
\`\`\`bash
TOKEN_ADMIN="<cookie-admin>"

# Consulter les logs
curl http://localhost:3000/api/admin/audit-logs \
  -H "Cookie: next-auth.session-token=$TOKEN_ADMIN"
\`\`\`

**Résultat attendu**: JSON avec liste d'actions récentes incluant vos tests précédents

---

## Vérification Console

### Dans le terminal du serveur

Vous devriez voir des logs comme:
\`\`\`
[AUDIT] {
  "action": "LOGIN_FAILED",
  "userEmail": "test@test.com",
  "success": false,
  "ipAddress": "127.0.0.1",
  "timestamp": "2026-01-23T..."
}
\`\`\`

---

## Checklist Rapide

- [ ] Rate limiting fonctionne (429 après 5 tentatives)
- [ ] Messages d'erreur génériques (pas de fuite d'info)
- [ ] Permissions vérifiées (404 pour ressources inaccessibles)
- [ ] Headers de sécurité présents
- [ ] Audit logs fonctionnels

Si tous les tests passent, les corrections de sécurité sont opérationnelles.

---

## En Cas de Problème

### Rate Limiting ne fonctionne pas
- Vérifier que `/lib/security/rate-limiter.ts` existe
- Vérifier les imports dans les routes API
- Redémarrer le serveur

### Permissions ne sont pas vérifiées
- Vérifier que `/lib/security/permissions.ts` existe
- Vérifier les appels à `canAccessBooking()` dans les APIs
- Vérifier que les sessions contiennent bien l'ID utilisateur

### Audit Logs vides
- Vérifier que `/lib/security/audit-log.ts` existe
- Vérifier les appels à `logResourceAction()` dans les APIs
- Vérifier la console du serveur

### Headers manquants
- Vérifier `/proxy.ts` et `/next.config.mjs`
- Redémarrer le serveur
- Vider le cache du navigateur

---

## Test Complet (Optionnel)

Pour un test exhaustif, exécuter:

\`\`\`bash
# 1. Démarrer le serveur
npm run dev

# 2. Dans un autre terminal, lancer tous les tests
./scripts/test-security.sh
\`\`\`

**Note**: Ce script peut être créé pour automatiser tous les tests ci-dessus.

---

**Durée totale**: ~5 minutes
**Prérequis**: Serveur local en cours d'exécution
**Niveau**: Débutant
