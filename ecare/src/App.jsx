import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Router from "./router";
import styles from "./App.module.css";

const App = () => {
  return (
    <div className={styles.root}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        draggable
        pauseOnHover={false}
        transition={Slide}
        theme="colored"
      />
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  );
};

export default App;
