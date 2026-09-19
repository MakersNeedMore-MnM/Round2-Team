from data.loader import load_health_data
from services.analytics import (
    discover_headache_relationships,
    relationship_label
)

df = load_health_data("data/health_data.csv")
relationships = discover_headache_relationships(df)

print("\n========== PERSONAL HEALTH RELATIONSHIPS ==========\n")
for relationship in relationships:
    feature = relationship["feature"]
    correlation = relationship["correlation"]
    strength = relationship["strength"]
    label = relationship_label(strength)

    print(
        f"{feature:20} "
        f"correlation: {correlation:+.3f} "
        f"strength: {strength:.3f} "
        f"({label})"
    )