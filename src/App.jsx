import React from "react";
import { RouterProvider } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { AITokenProvider } from "./contexts/AITokenContext";
import { CourseGenerationProvider } from "./contexts/CourseGenerationContext";
import { router } from "./router.jsx";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <AITokenProvider>
        <CourseGenerationProvider>
          <RouterProvider router={router} />
        </CourseGenerationProvider>
      </AITokenProvider>
    </UserProvider>
  );
}

export default App;
