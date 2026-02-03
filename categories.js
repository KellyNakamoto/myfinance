 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/categories.js b/categories.js
new file mode 100644
index 0000000000000000000000000000000000000000..2c540d5770b8ebdcd63548fdaff8afe41afd4bec
--- /dev/null
+++ b/categories.js
@@ -0,0 +1,79 @@
+const CATEGORY_CONFIG = [
+  {
+    id: "work",
+    name: "Работа",
+    icon: "💼",
+    type: "income",
+    keywords: []
+  },
+  {
+    id: "freelance",
+    name: "Подработка",
+    icon: "🧑‍💻",
+    type: "income",
+    keywords: []
+  },
+  {
+    id: "investment",
+    name: "Инвестиции",
+    icon: "📈",
+    type: "income",
+    keywords: []
+  },
+  {
+    id: "other",
+    name: "Прочее",
+    icon: "📋",
+    type: "shared",
+    keywords: []
+  },
+  {
+    id: "food",
+    name: "Еда",
+    icon: "🍽️",
+    type: "expense",
+    keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин"]
+  },
+  {
+    id: "transport",
+    name: "Транспорт",
+    icon: "🚗",
+    type: "expense",
+    keywords: ["такси", "автобус", "метро", "бензин", "парковка"]
+  },
+  {
+    id: "entertainment",
+    name: "Развлечения",
+    icon: "🎬",
+    type: "expense",
+    keywords: ["кино", "концерт", "игры", "развлечения"]
+  },
+  {
+    id: "shopping",
+    name: "Покупки",
+    icon: "🛍️",
+    type: "expense",
+    keywords: ["одежда", "обувь", "техника", "покупки"]
+  },
+  {
+    id: "housing",
+    name: "Жилье",
+    icon: "🏠",
+    type: "expense",
+    keywords: ["квартира", "аренда", "коммунальные"]
+  },
+  {
+    id: "utilities",
+    name: "Коммунальные",
+    icon: "📡",
+    type: "expense",
+    keywords: ["интернет", "телефон", "электричество"]
+  },
+  {
+    id: "health",
+    name: "Здоровье",
+    icon: "⚕️",
+    type: "expense",
+    keywords: ["врач", "лекарства", "аптека"]
+  }
+];
 
EOF
)
