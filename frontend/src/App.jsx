import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import FacultyDetails from "../pages/FacultyDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/faculty/:id"
          element={<FacultyDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;