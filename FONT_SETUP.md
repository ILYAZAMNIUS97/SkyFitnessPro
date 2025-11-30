# Настройка шрифтов в SkyFitnessPro

## Подключенные шрифты

### Roboto

- **Источник:** Google Fonts
- **Веса:** 400 (Regular), 500 (Medium), 700 (Bold)
- **Подключение:** `pages/_document.tsx`
- **Использование:** Основной шрифт для большинства элементов интерфейса

### Inter

- **Источник:** Google Fonts
- **Веса:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Подключение:** `pages/_document.tsx`
- **Использование:** Основной шрифт для body (глобальный)

## Где используется Roboto

Roboto применяется в следующих компонентах:

- ✅ Страницы тренировок (`WorkoutPage.module.css`)
- ✅ Модальные окна (`WorkoutSelectModal`, `ProgressModal`, `SuccessModal`)
- ✅ Страница профиля (`Profile.module.css`)
- ✅ Карточки курсов (`ProfileCourseCard.module.css`, `CourseCard.module.css`)
- ✅ Хедер (`Header.module.css`)
- ✅ Главная страница (`Home.module.css`)
- ✅ Страница курса (`CoursePage.module.css`)

## CSS переменные

В `styles/globals.css` добавлены переменные для удобства:

```css
--font-roboto: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

## Проверка загрузки шрифта

Если шрифт не применяется:

1. **Проверьте консоль браузера** на наличие ошибок загрузки
2. **Проверьте Network tab** - должен быть запрос к `fonts.googleapis.com`
3. **Убедитесь, что в CSS указан `font-family: 'Roboto', sans-serif;`**
4. **Проверьте, что шрифт не перекрывается другими стилями**

## Решение проблем

### Шрифт не применяется

- Убедитесь, что в элементе явно указан `font-family: 'Roboto', sans-serif;`
- Проверьте специфичность CSS - возможно, другой стиль перекрывает шрифт
- Используйте DevTools для проверки примененных стилей

### Шрифт загружается медленно

- Используется `font-display: swap` в Google Fonts (уже настроено)
- Шрифты предзагружаются через `preconnect` (уже настроено)
