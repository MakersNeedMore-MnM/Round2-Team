from data.loader import load_health_data
from services.graph import build_health_graph

df = load_health_data("data/health_data.csv")

graph = build_health_graph(df)

print("\n========== LIFEPRINT HEALTH GRAPH ==========\n")
print("NODES:")
for node in graph.nodes:
    print(f"  - {node}")

print("\nRELATIONSHIPS:")
for source, target, data in graph.edges(data=True):
    print(
        f"  {source} -> {target} | "
        f"strength: {data['strength']:.3f} | "
        f"direction: {data['direction']}"
    )