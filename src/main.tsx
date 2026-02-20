// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { Provider } from "react-redux";
// import { QueryClientProvider } from "@tanstack/react-query";

// import { store } from "./store";
// import { queryClient } from "./lib/react-query";
// import App from "./App";
// import "./index.css";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Provider store={store}>
//         <QueryClientProvider client={queryClient}>
//           <App />
//         </QueryClientProvider>
//       </Provider>
//     </BrowserRouter>
//   </StrictMode>
// );
// import { StrictMode } from "react";

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import ReactQueryProvider from "./provider/react-query-provider";
import "rc-pagination/assets/index.css";

import { store } from "./store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </Provider>,
  // </StrictMode>
);
