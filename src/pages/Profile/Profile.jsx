import { useEffect, useId, useState } from "react";
import { FiCamera, FiLogOut, FiMoon, FiTrash2, FiUser } from "react-icons/fi";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import styles from "./Profile.module.css";

const getProfilePhotoKey = (userId) => `profile_photo_${userId}`;

export function Profile() {
  const { user, logout } = useAuth();
  const { activeTheme, themes, setThemeId } = useTheme();
  const photoInputId = useId();
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setProfilePhoto("");
      return;
    }

    setProfilePhoto(localStorage.getItem(getProfilePhotoKey(user.id)) ?? "");
  }, [user?.id]);

  const handlePhotoChange = (event) => {
    const [file] = event.target.files;

    if (!file || !user?.id) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const photoData = reader.result.toString();
      localStorage.setItem(getProfilePhotoKey(user.id), photoData);
      setProfilePhoto(photoData);
    });

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (!user?.id) {
      return;
    }

    localStorage.removeItem(getProfilePhotoKey(user.id));
    setProfilePhoto("");
  };

  return (
    <Page eyebrow="Hesap" title="Profil" description="Profil bilgileri, tema ayarları ve özel oturum yönetimi.">
      <section className={styles.grid}>
        <Card className={styles.profile}>
          <div className={styles.avatar}>
            {profilePhoto ? <img src={profilePhoto} alt={`${user?.name} profil fotoğrafı`} /> : <FiUser />}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <span>{user?.role === "admin" ? "Admin" : "Kullanıcı"}</span>
            <div className={styles.photoControls}>
              <input
                id={photoInputId}
                className={styles.photoInput}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <label className={styles.photoButton} htmlFor={photoInputId}>
                <FiCamera />
                {profilePhoto ? "Fotoğrafı değiştir" : "Fotoğraf ekle"}
              </label>
              {profilePhoto && (
                <Button className={styles.removePhotoButton} variant="ghost" onClick={handleRemovePhoto}>
                  <FiTrash2 />
                  Kaldır
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className={styles.settings}>
          <h2>Tema Ayarları</h2>
          <div className={styles.settingRow}>
            <FiMoon />
            <div>
              <strong>{activeTheme.name}</strong>
              <p>{activeTheme.description}</p>
            </div>
          </div>
          <div className={styles.themeGrid}>
            {themes.map((theme) => (
              <button
                className={`${styles.themeOption} ${activeTheme.id === theme.id ? styles.activeTheme : ""}`}
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
                type="button"
              >
                <span className={styles.swatches}>
                  {theme.colors.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                <strong>{theme.name}</strong>
              </button>
            ))}
          </div>
          <Button variant="danger" onClick={logout}>
            <FiLogOut />
            Çıkış Yap
          </Button>
        </Card>
      </section>
    </Page>
  );
}
