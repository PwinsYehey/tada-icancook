import { useEffect, useRef } from "react";

function Header({
  user,
  onHome,
  onFavorites,
  onWeeklyPlanner,
  onLogin,
  onSignup,
  onLogout,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}) {
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!isMobileMenuOpen) return;

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        onCloseMobileMenu();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobileMenuOpen, onCloseMobileMenu]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" id="homeBrand" type="button" onClick={onHome}>
          <div className="brand-icon">
            <img
              src="/logo-chef-hat.png"
              alt="Chef hat icon"
              className="brand-icon-img"
            />
          </div>

          <div className="brand-text">
            <h1>TaDa! I Can Cook!</h1>
            <p>Discover recipes, explore flavors, cook with confidence.</p>
          </div>
        </button>

        <div className="header-actions">
          <div className="header-actions-desktop">
            {user && (
              <span className="user-badge">{user.email || "Logged in"}</span>
            )}

            <button className="btn btn-outline header-favorites-btn" type="button" onClick={onFavorites}>
              Favorites
            </button>

            <button className="btn btn-primary" type="button" onClick={onWeeklyPlanner}>
              Weekly Planner
            </button>

            {!user && (
              <>
                <button className="btn btn-outline" type="button" onClick={onLogin}>
                  Login
                </button>

                <button className="btn btn-outline" type="button" onClick={onSignup}>
                  Sign Up
                </button>
              </>
            )}

            {user && (
              <button className="btn btn-outline" type="button" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>

          <div className="header-actions-mobile" ref={mobileMenuRef}>
            <button
              className="btn btn-outline mobile-menu-btn"
              type="button"
              aria-expanded={isMobileMenuOpen}
              onClick={onToggleMobileMenu}
            >
              ☰ Menu
            </button>

            <div className={`mobile-menu-panel ${isMobileMenuOpen ? "" : "hidden"}`}>
              {user && (
                <span className="mobile-user-badge">
                  {user.email || "Logged in"}
                </span>
              )}

              <button
                className="mobile-menu-item mobile-menu-item--favorites"
                type="button"
                onClick={() => {
                  onCloseMobileMenu();
                  onFavorites();
                }}
              >
                Favorites
              </button>

              <button
                className="mobile-menu-item mobile-menu-item--primary"
                type="button"
                onClick={() => {
                  onCloseMobileMenu();
                  onWeeklyPlanner();
                }}
              >
                Weekly Planner
              </button>

              {!user && (
                <>
                  <button
                    className="mobile-menu-item"
                    type="button"
                    onClick={() => {
                      onCloseMobileMenu();
                      onLogin();
                    }}
                  >
                    Login
                  </button>

                  <button
                    className="mobile-menu-item"
                    type="button"
                    onClick={() => {
                      onCloseMobileMenu();
                      onSignup();
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}

              {user && (
                <button
                  className="mobile-menu-item"
                  type="button"
                  onClick={() => {
                    onCloseMobileMenu();
                    onLogout();
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;