import logging
from neo4j import GraphDatabase, exceptions as neo4j_exceptions
from django.conf import settings
from .exceptions import CognoDBConnectionError, CognoDBQueryError

logger = logging.getLogger(__name__)

class CognoDBClient:
    """Singleton client for interacting with the Neo4j (CognoDB) database."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_driver()
        return cls._instance

    def _init_driver(self):
        try:
            uri = settings.COGNODB_URI
            username = settings.COGNODB_USERNAME
            password = settings.COGNODB_PASSWORD
            
            # Using neo4j python driver
            self._driver = GraphDatabase.driver(uri, auth=(username, password))
            # Verify connectivity immediately
            self._driver.verify_connectivity()
            logger.info("Successfully connected to CognoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to CognoDB: {e}")
            self._driver = None

    def close(self):
        if self._driver:
            self._driver.close()

    def _get_session(self):
        if not self._driver:
            self._init_driver()
            if not self._driver:
                raise CognoDBConnectionError("Cannot connect to CognoDB instance.")
        return self._driver.session()

    def execute_read(self, query, parameters=None):
        """Executes a read transaction and returns a list of dictionaries."""
        parameters = parameters or {}
        try:
            with self._get_session() as session:
                result = session.execute_read(self._tx_func, query, parameters)
                return result
        except neo4j_exceptions.ServiceUnavailable as e:
            raise CognoDBConnectionError(f"Database service unavailable: {e}")
        except Exception as e:
            raise CognoDBQueryError(f"Read query failed: {e}")

    def execute_write(self, query, parameters=None):
        """Executes a write transaction and returns a list of dictionaries."""
        parameters = parameters or {}
        try:
            with self._get_session() as session:
                result = session.execute_write(self._tx_func, query, parameters)
                return result
        except neo4j_exceptions.ServiceUnavailable as e:
            raise CognoDBConnectionError(f"Database service unavailable: {e}")
        except Exception as e:
            raise CognoDBQueryError(f"Write query failed: {e}")

    @staticmethod
    def _tx_func(tx, query, parameters):
        result = tx.run(query, parameters)
        return [record.data() for record in result]

    def ping(self):
        """Health check query to verify database is responsive."""
        try:
            result = self.execute_read("MATCH (n) RETURN count(n) AS count")
            return result[0]['count'] >= 0
        except Exception as e:
            logger.error(f"Ping failed: {e}")
            raise CognoDBConnectionError("Ping failed.")

# Expose a singleton instance
client = CognoDBClient()
