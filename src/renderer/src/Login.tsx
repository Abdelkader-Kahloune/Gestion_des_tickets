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
import { useNavigate } from "react-router-dom";

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

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
  const navigate = useNavigate();

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
                  Authentification
                </Typography>
                <Typography level="body-sm">
                  Nouveau dans l&apos;entreprise?{" "}
                  <Link href="/inscription" level="title-sm">
                    Créer un compte!
                  </Link>
                </Typography>
              </Stack>
            </Stack>

            <form
              onSubmit={async (event: React.FormEvent<SignInFormElement>) => {
                event.preventDefault();
                setLoading(true);
                const formData = new FormData(event.currentTarget);
                const email = (formData.get("email") as string)?.trim();
                const password = (formData.get("password") as string)?.trim();

                try {
                  const user = await window.api.getUserByEmail(email);
                  if (!user || user.mot_de_passe !== password) {
                    setOpenSnackbar(true);
                    setLoading(false);
                  } else {
                    setTimeout(() => {
                      if (user.role === "admin") {
                        navigate("/ticket-table");
                      } else {
                        navigate(`/ticket/${user.matricule}`);
                      }
                      setLoading(false);
                    }, 1000);
                  }
                } catch (error) {
                  setOpenSnackbar(true);
                  setLoading(false);
                }
              }}
            >
              <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl required>
                <FormLabel>Mot de passe</FormLabel>
                <Input type="password" name="password" />
              </FormControl>
              <Stack sx={{ gap: 4, mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link level="title-sm" href="mot_de_passe_oublié">
                    Mot de passe oublié?
                  </Link>
                </Box>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? <CircularProgress size="sm" /> : "Authentifier"}
                </Button>
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
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          fontSize: "1rem",
          width: "100%",
          maxWidth: 100,
        }}
      >
        <Alert>Email ou mot de passe incorrect.</Alert>
      </Snackbar>
      <NeatBackground />
    </CssVarsProvider>
  );
}
