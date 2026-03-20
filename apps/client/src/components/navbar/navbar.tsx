import { useLocation, useNavigate } from "react-router-dom";
import styles from "./navbar.module.css";
import { NavbarRoutesEnum } from "../../types";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();

  const isPageActive = (path: string) => pathname === path;

  return (
    <div className={styles.navbarContainer}>
      <div
        className={`${styles.navigationButton} ${isPageActive(NavbarRoutesEnum.HOME_PAGE) && styles.activePage}`}
        onClick={() => navigate(NavbarRoutesEnum.HOME_PAGE)}
      >
        Home Page
      </div>
      <div
        className={`${styles.navigationButton} ${isPageActive(NavbarRoutesEnum.HOME_FEED) && styles.activePage}`}
        onClick={() => navigate(NavbarRoutesEnum.HOME_FEED)}
      >
        Home Feed
      </div>
      <div
        className={`${styles.navigationButton} ${isPageActive(NavbarRoutesEnum.USER_PAGE) && styles.activePage}`}
        onClick={() => navigate(NavbarRoutesEnum.USER_PAGE)}
      >
        User Page
      </div>
      <div
        className={`${styles.navigationButton} ${isPageActive(NavbarRoutesEnum.CHATBOT) && styles.activePage}`}
        onClick={() => navigate(NavbarRoutesEnum.CHATBOT)}
      >
        Chatbot
      </div>
    </div>
  );
};
