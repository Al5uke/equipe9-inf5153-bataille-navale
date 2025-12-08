"""Gestionnaire de base de données SQLite3"""
import sqlite3
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent / 'bataille_navale.db'
SQL_INIT_PATH = Path(__file__).parent / 'init_db.sql'

class Database:
    """Gestionnaire de connexion à la base de données SQLite3"""
    
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Retourne une connexion à la base de données"""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row  # Pour avoir des résultats en dict
        return conn
    
    def init_database(self):
        """Initialise la base de données avec le script SQL"""
        if not SQL_INIT_PATH.exists():
            logger.error(f"Script SQL non trouvé: {SQL_INIT_PATH}")
            return
        
        try:
            with open(SQL_INIT_PATH, 'r', encoding='utf-8') as f:
                sql_script = f.read()
            
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.executescript(sql_script)
            conn.commit()
            conn.close()
            logger.info("Base de données initialisée avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la base de données: {e}")
    
    def execute_query(self, query, params=None):
        """Exécute une requête SQL et retourne les résultats"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            results = cursor.fetchall()
            conn.commit()
            return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Erreur lors de l'exécution de la requête: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def execute_insert(self, query, params=None):
        """Exécute une requête INSERT et retourne l'ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            logger.error(f"Erreur lors de l'insertion: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def execute_update(self, query, params=None):
        """Exécute une requête UPDATE/DELETE"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

# Instance globale
db = Database()