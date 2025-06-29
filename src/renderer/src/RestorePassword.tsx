import * as React from "react";
import NeatBackground from "./styles/background";
import { CssVarsProvider, extendTheme, useColorScheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";

import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { IconButtonProps } from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import TT_Logo from "./assets/TT_Logo.svg";
import Snackbar from "@mui/joy/Snackbar";
import Alert from "@mui/joy/Alert";
import CircularProgress from "@mui/joy/CircularProgress";

function ColorSchemeToggle(props: IconButtonProps): React.ReactElement {
  const { onClick, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      disabled={!mounted}
      onClick={(event) => {
        setMode(mode === "light" ? "dark" : "light");
        onClick?.(event);
      }}
      {...other}
    >
      {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

const customTheme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},
  },
});

export default function JoySignInSideTemplate(): React.ReactElement {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [snackbarMsg, setSnackbarMsg] = React.useState(
    "Si un compte existe pour cet email, le mot de passe a été envoyé par email."
  );
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await window.api.sendPasswordByEmail(email);
      if (res && res.success) {
        setSnackbarMsg("Le mot de passe a été envoyé à votre adresse email.");
      } else if (res && res.message) {
        setSnackbarMsg(res.message);
        setError(res.message);
      } else {
        setSnackbarMsg("Aucun compte trouvé pour cet email.");
        setError("Aucun compte trouvé pour cet email.");
      }
      setOpenSnackbar(true);
    } catch (e: any) {
      const msg =
        e?.message ||
        (typeof e === "string" ? e : "Erreur lors de l'envoi de l'email.");
      setSnackbarMsg(msg);
      setError(msg);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0s",
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: "100%", md: "50vw" },
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(30px)",
          backgroundColor: "rgba(255 255 255 / 0.7)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19 19 24 / 0.7)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 3,
          }}
        >
          <Box
            component="header"
            sx={{
              py: 2,
              px: 3,
              display: "flex",
              justifyContent: "space-between",
              minHeight: "100px",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
              <img
                src={TT_Logo}
                alt="TT Logo"
                style={{ width: 86, height: 86 }}
              />
              <Typography level="title-lg">Espace Personnel</Typography>
            </Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Mot de passe oublié ?
                </Typography>
                <Typography level="body-sm">
                  Entrez votre adresse email pour recevoir votre mot de passe.
                </Typography>
              </Stack>
            </Stack>
            <form onSubmit={handleSubmit}>
              <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </FormControl>
              {error && (
                <Alert color="danger" variant="soft" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
              <Stack sx={{ gap: 4, mt: 2 }}>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? (
                    <CircularProgress size="sm" />
                  ) : (
                    "Envoyer le mot de passe"
                  )}
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link level="title-sm" href="/login">
                    Retour à la connexion
                  </Link>
                </Box>
              </Stack>
            </form>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              © Tunisie Telecom {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          fontSize: "1rem",
          width: "100%",
          maxWidth: 422,
        }}
      >
        <Alert>{snackbarMsg}</Alert>
      </Snackbar>
      <NeatBackground />
    </CssVarsProvider>
  );
}
