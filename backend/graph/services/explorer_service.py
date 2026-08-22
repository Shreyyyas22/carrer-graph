from graph.client import client
from graph.queries.explorer_queries import GET_NODE_NEIGHBORHOOD, SEARCH_NODES

class ExplorerService:
    @staticmethod
    def get_neighborhood(node_id: str):
        return client.execute_read(GET_NODE_NEIGHBORHOOD, {"node_id": node_id})

    @staticmethod
    def search(query: str):
        return client.execute_read(SEARCH_NODES, {"q": query})
