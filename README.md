# 🎬 CineSearch

**CineSearch** is a modern React web application for discovering movies and TV shows using the OMDb API. It features advanced search, infinite scrolling, detailed movie pages, and a stylish UI built with Tailwind CSS and Material UI.

---

## 🚀 Features

- 🔍 **Advanced Search** — Search by title, year, and type (movie, series, episode).
- ♾️ **Infinite Scrolling** — Seamlessly load more results as you scroll.
- 📄 **Movie Details** — View rich details, cast, ratings, and more.
- 🖌️ **Responsive UI** — Built with Tailwind CSS, Material UI, and custom design.
- 🌙 **Dark Theme** — Consistent dark mode experience.
- 🛠️ **Routing** — Client-side routing with React Router.
- 🧩 **Error Handling** — Custom 404 page and graceful error messages.

---

## 🧰 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cinesearch.git
   cd cinesearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OMDb API Key**
   - Register for a free API key at [OMDb API](http://www.omdbapi.com/apikey.aspx)
   - Create a `.env` file in the root directory:
     ```
     VITE_MOVIE_API_KEY=your_api_key_here
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🏗️ Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
  api/           # API calls to OMDb
  assets/        # Images & videos
  components/    # Layout & UI components
  pages/         # Route pages (Home, Movie, Details, etc.)
  App.jsx        # Main app router
  main.jsx       # Entry point
  theme.js       # MUI theme config
  index.css      # Tailwind CSS config

public/
  index.html
  screenshots/   # UI previews
```

---

## 🛠️ Technologies Used

- React 18  
- Vite  
- Tailwind CSS  
- Material UI  
- Axios  
- React Router  
- OMDb API  

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

[MIT](LICENSE)

---

**Made with ❤️ by Numan Nadeem**
