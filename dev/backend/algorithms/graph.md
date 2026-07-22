1. Kry edges tussen users wat kan optel en users wat opgetel moet word
2. Kry die kortste edge
3. Remove die korste pad se origin se edges en los net die edge van stap 2
4. Remove die korste pad se prerequisite node se incoming edges, behalwe die edge van stap 2
5. As die korste pad se prerequisite node nie exhausted is nie connect ander prerequisite nodes
6. Volg nou weer vanaf stap 2 totdat al die prerequisites bereik is
7. Connect alle pickup groups aan destination node
8. Kry mees gerieflikste destination