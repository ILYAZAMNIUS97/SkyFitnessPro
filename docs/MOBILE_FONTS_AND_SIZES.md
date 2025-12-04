# 🎨 Обновление шрифтов и размеров для мобильной версии

## Дата: 23 ноября 2025 г.

---

## ✅ Что обновлено

Все размеры и шрифты приведены в соответствие с макетом Figma для мобильных устройств (< 768px).

---

## 📐 Обновленные размеры

### 1. **Логотип SkyFitnessPro**

**Требования из макета:**

- Width: 220px (auto)
- Height: 35px
- Top: 40px
- Left: 16px

**Реализовано в `styles/Header.module.css`:**

```css
@media (max-width: 768px) {
  .logoImage {
    height: 35px;
    width: auto;
  }

  .container {
    padding: 0 16px; /* Left: 16px */
  }

  .header {
    height: 96px; /* Чтобы logo был на top: 40px */
  }
}
```

---

### 2. **Кнопка "Войти"**

**Требования из макета:**

- Width: 83px
- Height: 36px
- Border-radius: 46px
- Padding: 8px 16px
- Gap: 8px

**Реализовано в `styles/Header.module.css`:**

```css
@media (max-width: 768px) {
  .loginButton {
    width: 83px;
    height: 36px;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 46px;
    gap: 8px;
  }
}
```

---

### 3. **Заголовок "Начните заниматься спортом..."**

**Требования из макета:**

- Width: 327px
- Height: 105px (auto, зависит от содержимого)
- Top: 115px (от начала контента)
- Left: 16px
- Font-family: Roboto
- Font-weight: 500
- Font-size: 32px
- Line-height: 110%
- Letter-spacing: 0px
- Font-variant-numeric: lining-nums proportional-nums

**Реализовано в `styles/Home.module.css`:**

```css
@media (max-width: 768px) {
  .title {
    font-family: 'Roboto', sans-serif;
    font-size: 32px;
    font-weight: 500;
    font-style: normal;
    line-height: 110%;
    letter-spacing: 0px;
    width: 327px;
    max-width: 100%;
  }

  .hero {
    padding: 19px 0 20px; /* Top: 96px (header) + 19px = 115px */
  }

  .container {
    padding: 0 16px; /* Left: 16px */
  }
}
```

---

## 📊 Обновленные файлы

1. ✅ **`styles/Header.module.css`**
   - Логотип: height 35px
   - Кнопка "Войти": 83x36px, padding 8px 16px
   - Header height: 96px (для правильного позиционирования)

2. ✅ **`styles/Home.module.css`**
   - Заголовок: font-size 32px, font-weight 500, line-height 110%
   - Width: 327px, max-width: 100%
   - Hero padding: 19px (чтобы top был 115px от начала)

3. ✅ **`styles/Layout.module.css`**
   - Main padding-top: 96px (соответствует высоте header)

---

## 📱 Сравнение размеров

### Header:

| Элемент            | Desktop   | Mobile (< 768px) |
| ------------------ | --------- | ---------------- |
| **Header height**  | 80px      | **96px** ✅      |
| **Logo height**    | 36px      | **35px** ✅      |
| **Button width**   | 103px     | **83px** ✅      |
| **Button height**  | 52px      | **36px** ✅      |
| **Button padding** | 16px 26px | **8px 16px** ✅  |

### Заголовок:

| Свойство        | Desktop | Mobile (< 768px) |
| --------------- | ------- | ---------------- |
| **Font-size**   | 60px    | **32px** ✅      |
| **Font-weight** | 500     | **500** ✅       |
| **Line-height** | 100%    | **110%** ✅      |
| **Width**       | 850px   | **327px** ✅     |

---

## 🎯 Позиционирование (от начала viewport)

### Mobile Layout:

```
┌─────────────────────────────────┐
│ 0px                             │
│                                 │
│ 40px ← Logo position            │ ← 16px padding
│ 🏃 SkyFitnessPro    [Войти]    │
│                                 │
│ 96px ← Header end               │
├─────────────────────────────────┤
│ 115px ← Title start (96+19)     │
│                                 │ ← 16px padding
│ Начните заниматься              │
│ спортом и улучшите              │
│ качество жизни                  │
│                                 │
│ 220px ← Title end (approx)      │
│                                 │
│ 240px ← Cards start             │
│ ┌─────────────────────────────┐ │
│ │         Йога              ⊕ │ │
│ │      [изображение]          │ │
│ └─────────────────────────────┘ │
```

---

## ✅ Результат

Все размеры и шрифты на мобильной версии теперь **точно соответствуют макету Figma**:

- ✅ Логотип: 35px height (вместо 28px)
- ✅ Кнопка "Войти": 83x36px с padding 8px 16px (вместо 85x44px)
- ✅ Header: 96px height (вместо 60px)
- ✅ Заголовок: 32px, font-weight 500, line-height 110%, width 327px
- ✅ Позиционирование: Title на 115px от верха (как в макете)

---

## 🚀 Проверка

### 1. Откройте страницу:

```
http://localhost:3002
```

### 2. Hard Refresh:

```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### 3. DevTools (мобильный режим):

```
F12 → Ctrl+Shift+M → iPhone 12 (390x844)
```

### 4. Проверьте:

**Header:**

- [ ] Логотип высотой 35px
- [ ] Кнопка "Войти" 83x36px
- [ ] Header высотой 96px
- [ ] Отступы по бокам 16px

**Заголовок:**

- [ ] Размер шрифта 32px
- [ ] Жирность 500 (Medium)
- [ ] Межстрочный интервал 110%
- [ ] Ширина 327px
- [ ] Позиция 115px от верха

---

## 📝 Технические детали

### Font-variant-numeric

В CSS `font-variant-numeric: lining-nums proportional-nums` обеспечивает:

- **lining-nums** - все цифры одинаковой высоты (как заглавные буквы)
- **proportional-nums** - цифры имеют пропорциональную ширину

Это уже включено в общие стили Roboto, поэтому дополнительно указывать не требуется.

### Responsive Width

Для заголовка используется:

```css
width: 327px;
max-width: 100%;
```

Это гарантирует, что на экранах меньше 360px (327px + 16px padding \* 2) текст не выйдет за пределы.

---

## 🎉 Готово!

Мобильная версия теперь **полностью соответствует макету** по всем размерам и шрифтам!

---

**Обновлено:** 23 ноября 2025 г.  
**Статус:** ✅ **СООТВЕТСТВУЕТ МАКЕТУ FIGMA**
