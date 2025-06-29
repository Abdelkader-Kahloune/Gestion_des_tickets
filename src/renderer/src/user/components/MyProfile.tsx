import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import type { FC } from 'react';

export const MyProfile: FC = () => {
  return (
    <Box sx={{ flex: 1, width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', bgcolor: 'background.body' }}>
      <Card sx={{ width: 600, mt: 6 }}>
        <CardContent>
          <Typography level="h4" component="h2" sx={{ mb: 2 }}>
            L&apos;Ajout d&apos;une Ticket
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form>
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Matricule :</FormLabel>
                <Input name="matricule" placeholder="Matricule" />
              </FormControl>
              <FormControl required>
                <FormLabel>Nom & prénom :</FormLabel>
                <Input name="nomPrenom" placeholder="Nom & prénom" />
              </FormControl>
              <FormControl required>
                <FormLabel>Nombre de personne :</FormLabel>
                <Input name="nombre" type="number" placeholder="Nombre de personne" slotProps={{ input: { min: 1 } }} />
              </FormControl>
              <FormControl required>
                <FormLabel>Type de Ticket :</FormLabel>
                <RadioGroup name="typeTicket" orientation="vertical">
                  <Radio value="subventionne" label="subventionne" />
                  <Radio value="non subventionne" label="non subventionne" />
                </RadioGroup>
              </FormControl>
              <FormControl required>
                <FormLabel>Offre :</FormLabel>
                <RadioGroup name="offre" orientation="vertical">
                  <Radio value="self" label="self" />
                  <Radio value="Sandwitch" label="Sandwitch" />
                </RadioGroup>
              </FormControl>
              <Button type="submit" color="primary" variant="solid">
                Ajouter
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyProfile;
