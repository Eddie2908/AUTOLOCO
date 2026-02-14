"use client"

/**
 * Interface de Gestion des Utilisateurs de Test
 * ==============================================
 * 
 * Page admin pour générer et gérer des utilisateurs fictifs
 * pour tester les fonctionnalités de l'application
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Users, UserPlus, RefreshCw, Copy, CheckCircle2, Trash2, Eye, EyeOff } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GeneratedUser {
  email: string
  password: string
  role: string
  nom: string
  statut: string
}

export default function TestUsersPage() {
  const [loading, setLoading] = useState(false)
  const [generatedUsers, setGeneratedUsers] = useState<GeneratedUser[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  
  // Configuration du générateur
  const [config, setConfig] = useState({
    locataires: 5,
    proprietaires: 3,
    admins: 1,
  })

  /**
   * Génère les utilisateurs via l'API
   */
  const generateUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/generate-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération")
      }

      const data = await response.json()
      setGeneratedUsers(data.users)
      
      toast({
        title: "Utilisateurs générés",
        description: `${data.users.length} utilisateurs de test créés avec succès`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Supprime tous les utilisateurs de test
   */
  const deleteAllTestUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/delete-test-users", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      const data = await response.json()
      setGeneratedUsers([])
      
      toast({
        title: "Utilisateurs supprimés",
        description: `${data.count} utilisateurs de test supprimés`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  /**
   * Copie les identifiants dans le presse-papiers
   */
  const copyCredentials = (user: GeneratedUser) => {
    const credentials = `Email: ${user.email}\nMot de passe: ${user.password}\nRôle: ${user.role}`
    navigator.clipboard.writeText(credentials)
    
    toast({
      title: "Copié",
      description: "Identifiants copiés dans le presse-papiers",
    })
  }

  /**
   * Copie tous les identifiants
   */
  const copyAllCredentials = () => {
    const allCredentials = generatedUsers
      .map(u => `${u.email} | ${u.password} | ${u.role} | ${u.nom}`)
      .join("\n")
    
    navigator.clipboard.writeText(allCredentials)
    
    toast({
      title: "Tous les identifiants copiés",
      description: `${generatedUsers.length} comptes copiés`,
    })
  }

  /**
   * Exporte les identifiants en CSV
   */
  const exportToCSV = () => {
    const csv = [
      "Email,Mot de passe,Rôle,Nom,Statut",
      ...generatedUsers.map(u => 
        `${u.email},${u.password},${u.role},${u.nom},${u.statut}`
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `utilisateurs-test-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    
    toast({
      title: "Export réussi",
      description: "Fichier CSV téléchargé",
    })
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      locataire: "default",
      proprietaire: "secondary",
      admin: "destructive",
    }
    return <Badge variant={variants[role] || "default"}>{role}</Badge>
  }

  const getStatutBadge = (statut: string) => {
    return statut === "Actif" 
      ? <Badge variant="default" className="bg-green-500">Actif</Badge>
      : <Badge variant="secondary">En attente</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Environnement de Test</h1>
        <p className="text-muted-foreground">
          Générez des utilisateurs fictifs pour tester les fonctionnalités de l'application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Locataires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedUsers.filter(u => u.role === "locataire").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Propriétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedUsers.filter(u => u.role === "proprietaire").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedUsers.filter(u => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">
            <UserPlus className="mr-2 h-4 w-4" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="list">
            <Users className="mr-2 h-4 w-4" />
            Liste des utilisateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Générer des utilisateurs de test</CardTitle>
              <CardDescription>
                Configurez le nombre d'utilisateurs à créer pour chaque rôle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="locataires">Locataires</Label>
                  <Input
                    id="locataires"
                    type="number"
                    min="0"
                    max="50"
                    value={config.locataires}
                    onChange={(e) => setConfig({ ...config, locataires: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprietaires">Propriétaires</Label>
                  <Input
                    id="proprietaires"
                    type="number"
                    min="0"
                    max="20"
                    value={config.proprietaires}
                    onChange={(e) => setConfig({ ...config, proprietaires: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admins">Administrateurs</Label>
                  <Input
                    id="admins"
                    type="number"
                    min="0"
                    max="5"
                    value={config.admins}
                    onChange={(e) => setConfig({ ...config, admins: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Informations importantes</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Mot de passe par défaut : <code className="bg-background px-1 py-0.5 rounded">Test@2024!</code></li>
                  <li>Les emails générés utilisent le domaine @autoloco.cm ou @email.cm</li>
                  <li>Les données sont fictives mais réalistes</li>
                  <li>Les utilisateurs peuvent se connecter immédiatement</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateUsers}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Générer {config.locataires + config.proprietaires + config.admins} utilisateurs
                    </>
                  )}
                </Button>
                
                {generatedUsers.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer tout
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utilisateurs générés</CardTitle>
                  <CardDescription>
                    Liste des comptes de test disponibles
                  </CardDescription>
                </div>
                {generatedUsers.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? (
                        <><EyeOff className="mr-2 h-4 w-4" /> Masquer</>
                      ) : (
                        <><Eye className="mr-2 h-4 w-4" /> Afficher</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllCredentials}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Tout copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                    >
                      Exporter CSV
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun utilisateur généré</p>
                  <p className="text-sm">Utilisez l'onglet "Générer" pour créer des utilisateurs de test</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Mot de passe</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedUsers.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{user.email}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {showPasswords ? user.password : "••••••••"}
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.nom}</TableCell>
                          <TableCell>{getStatutBadge(user.statut)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCredentials(user)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer tous les utilisateurs de test ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement tous les utilisateurs générés.
              Cette opération est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAllTestUsers} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
