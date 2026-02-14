"""
Script de diagnostic pour tester la connexion à SQL Server
"""
import sys
from pathlib import Path

# Ajouter le répertoire racine au PYTHONPATH
root_path = Path(__file__).parent.parent
sys.path.insert(0, str(root_path))

from sqlalchemy import create_engine, text
import pyodbc


def test_pyodbc_direct():
    """Test de connexion directe avec pyodbc"""
    print("\n=== Test 1: Connexion directe avec pyodbc ===")
    try:
        conn_str = (
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost,1433;"
            "DATABASE=autoloco_db;"
            "UID=autoloco_app;"
            "PWD=Ch@ng3M3InPr0duct!0n2025;"
            "TrustServerCertificate=yes"
        )
        conn = pyodbc.connect(conn_str, timeout=5)
        print("✅ Connexion pyodbc réussie!")
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        row = cursor.fetchone()
        print(f"Version SQL Server: {row[0][:100]}...")
        conn.close()
        return True
    except pyodbc.Error as e:
        print(f"❌ Erreur pyodbc: {e}")
        return False


def test_sqlalchemy_connection():
    """Test de connexion avec SQLAlchemy"""
    print("\n=== Test 2: Connexion avec SQLAlchemy ===")
    try:
        # URL correctement encodée
        database_url = (
            "mssql+pyodbc://autoloco_app:Ch%40ng3M3InPr0duct!0n2025@localhost:1433/autoloco_db"
            "?driver=ODBC+Driver+17+for+SQL+Server"
            "&TrustServerCertificate=yes"
        )
        print(f"URL de connexion: {database_url}")
        
        engine = create_engine(database_url, echo=False)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT @@VERSION"))
            version = result.fetchone()[0]
            print(f"✅ Connexion SQLAlchemy réussie!")
            print(f"Version SQL Server: {version[:100]}...")
            return True
    except Exception as e:
        print(f"❌ Erreur SQLAlchemy: {e}")
        return False


def check_sql_server_service():
    """Vérifier si le service SQL Server est démarré"""
    print("\n=== Test 3: Vérification du service SQL Server ===")
    print("Pour vérifier manuellement, exécutez dans PowerShell:")
    print('  Get-Service -Name "MSSQL*" | Select-Object Name, Status')
    print("\nOu dans Services Windows (services.msc):")
    print("  - Cherchez 'SQL Server (MSSQLSERVER)' ou 'SQL Server (nom_instance)'")
    print("  - Vérifiez que le statut est 'En cours d'exécution'")


def check_sql_server_tcp():
    """Instructions pour vérifier TCP/IP"""
    print("\n=== Test 4: Configuration TCP/IP de SQL Server ===")
    print("1. Ouvrez 'SQL Server Configuration Manager'")
    print("2. Allez dans 'SQL Server Network Configuration' > 'Protocols for MSSQLSERVER'")
    print("3. Vérifiez que 'TCP/IP' est activé")
    print("4. Clic droit sur TCP/IP > Propriétés > Onglet 'IP Addresses'")
    print("5. Trouvez 'IPAll' et vérifiez que 'TCP Port' = 1433")
    print("6. Si vous changez quelque chose, redémarrez le service SQL Server")


def main():
    print("=" * 60)
    print("DIAGNOSTIC DE CONNEXION SQL SERVER")
    print("=" * 60)
    
    # Test 1: Connexion directe
    pyodbc_ok = test_pyodbc_direct()
    
    # Test 2: Connexion SQLAlchemy
    sqlalchemy_ok = test_sqlalchemy_connection()
    
    # Instructions supplémentaires si échec
    if not pyodbc_ok or not sqlalchemy_ok:
        check_sql_server_service()
        check_sql_server_tcp()
        
        print("\n" + "=" * 60)
        print("SOLUTIONS POSSIBLES:")
        print("=" * 60)
        print("1. Vérifiez que SQL Server est démarré:")
        print("   PowerShell: Start-Service -Name 'MSSQL$MSSQLSERVER'")
        print("\n2. Vérifiez les credentials:")
        print("   - Username: autoloco_app")
        print("   - Password: Ch@ng3M3InPr0duct!0n2025")
        print("   - Database: autoloco_db")
        print("\n3. Vérifiez le port TCP/IP (1433)")
        print("\n4. Activez les connexions TCP/IP dans SQL Server Configuration Manager")
        print("\n5. Si vous utilisez une instance nommée:")
        print("   Remplacez 'localhost' par 'localhost\\NOM_INSTANCE'")
    else:
        print("\n" + "=" * 60)
        print("✅ TOUTES LES CONNEXIONS FONCTIONNENT!")
        print("=" * 60)
        print("Vous pouvez maintenant exécuter vos tests pytest.")


if __name__ == "__main__":
    main()
