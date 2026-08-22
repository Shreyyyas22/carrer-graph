from neo4j.graph import Node, Relationship


def serialize_neo4j_value(value):
    """Recursively convert Neo4j driver types to JSON-serializable structures."""
    if isinstance(value, Node):
        data = dict(value)
        data["label"] = next(iter(value.labels), None)
        return data
    if isinstance(value, Relationship):
        data = dict(value)
        data["type"] = value.type
        return data
    if isinstance(value, dict):
        return {key: serialize_neo4j_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_neo4j_value(item) for item in value]
    return value


def shape_neighborhood(records):
    """Transform flat neighborhood query results into a graph-friendly structure."""
    nodes_by_id = {}
    relationships = []

    for record in records:
        source = serialize_neo4j_value(record["source_node"])
        target = serialize_neo4j_value(record["target_node"])
        rel_type = record["relationship"]

        source["label"] = record.get("source_label")
        target["label"] = record.get("target_label")

        nodes_by_id[source["id"]] = source
        nodes_by_id[target["id"]] = target

        relationships.append(
            {
                "source": source["id"],
                "target": target["id"],
                "type": rel_type,
            }
        )

    return {
        "nodes": list(nodes_by_id.values()),
        "relationships": relationships,
    }
