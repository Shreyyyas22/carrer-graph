class CognoDBError(Exception):
    """Base class for all graph database exceptions."""
    pass

class CognoDBConnectionError(CognoDBError):
    """Raised when the connection to CognoDB fails."""
    pass

class CognoDBQueryError(CognoDBError):
    """Raised when a Cypher query execution fails."""
    pass

class NodeNotFoundError(CognoDBError):
    """Raised when an expected node is not found."""
    pass
