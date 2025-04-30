import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
// import { I18nextProvider } from "react-i18next";
// import i18n from "@/config/i18n";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  RecoilRoot,
} from 'recoil';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      {/* <I18nextProvider i18n={i18n}> */}
      <SidebarProvider>
        {/* <div className="flex flex-row-reverse w-full"> */}
        <AppSidebar side="left" variant="floating" />
        <SidebarInset className="flex-1 min-w-0">
          <SidebarTrigger />
          <RecoilRoot>
            <App />
          </RecoilRoot>
        </SidebarInset>
        {/* </div> */}
      </SidebarProvider>
      {/* </I18nextProvider> */}
    </BrowserRouter>
  </StrictMode>
);