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
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Table from "@mui/joy/Table";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Ticket {
  id: number;
  matricule: number;
  nomPrenom: string;
  nombre: number;
  typeTicket: string;
  offre: string;
  restoration?: string;
}

interface Restoration {
  id: number;
  nom: string;
}

export const MyTicket: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    matricule: id || "",
    nomPrenom: "",
    nombre: 1,
    typeTicket: "subventionne",
    offre: "self-service",
    restoration: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [restorations, setRestorations] = useState<Restoration[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!form.matricule.trim()) {
      errors.matricule = "Le matricule est requis";
    }

    if (!form.nomPrenom.trim()) {
      errors.nomPrenom = "Le nom et prénom sont requis";
    } else if (form.nomPrenom.trim().length < 2) {
      errors.nomPrenom =
        "Le nom et prénom doivent contenir au moins 2 caractères";
    }

    if (form.nombre < 1) {
      errors.nombre = "Le nombre doit être au moins 1";
    }

    if (!form.restoration) {
      errors.restoration = "La restauration est requise";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadRestorations = async () => {
    try {
      const restoList = await window.api.getRestorations();
      setRestorations(restoList || []);
    } catch (error) {
      console.error("Erreur lors du chargement des restaurations:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const loadTickets = async () => {
    if (id) {
      try {
        const userTickets = await window.api.getTicketsByMatricule(Number(id));
        setTickets(userTickets || []);
      } catch (error) {
        console.error("Erreur lors du chargement des tickets:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle number input specifically
    if (name === "nombre") {
      const numberValue = parseInt(value) || 1;
      setForm({ ...form, [name]: numberValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSelectChange = (name: string, value: string | null) => {
    setForm({ ...form, [name]: value || "" });

    // Clear validation error for this field when user makes a selection
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const resetForm = (): void => {
    setForm({
      matricule: id || "",
      nomPrenom: "",
      nombre: 1,
      typeTicket: "subventionne",
      offre: "self-service",
      restoration: "",
    });
    setIsEditing(false);
    setEditingTicketId(null);
    setValidationErrors({});
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleEdit = (ticket: Ticket) => {
    setForm({
      matricule: ticket.matricule.toString(),
      nomPrenom: ticket.nomPrenom,
      nombre: ticket.nombre,
      typeTicket: ticket.typeTicket,
      offre: ticket.offre,
      restoration: ticket.restoration || "",
    });
    setIsEditing(true);
    setEditingTicketId(ticket.id);
  };

  const handleCancelEdit = (): void => {
    resetForm();
  };

  const handleDeleteClick = (ticketId: number): void => {
    setTicketToDelete(ticketId);
    setDeleteConfirmOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleDeleteConfirm = async () => {
    if (ticketToDelete) {
      try {
        setLoading(true);
        const res = await window.api.deleteTicketById(ticketToDelete);

        if (res && res.success) {
          setSuccessMsg("Ticket supprimé avec succès !");
          await loadTickets();
        } else {
          setErrorMsg(
            res?.message || "Erreur lors de la suppression du ticket."
          );
        }
      } catch (err) {
        setErrorMsg("Erreur lors de la suppression du ticket." + err);
      } finally {
        setLoading(false);
        setDeleteConfirmOpen(false);
        setTicketToDelete(null);
      }
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteConfirmOpen(false);
    setTicketToDelete(null);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getRestorationName = (restorationId: string) => {
    const resto = restorations.find((r) => r.id.toString() === restorationId);
    return resto ? resto.nom : restorationId;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Always use id from params as matricule
      const matriculeNumber = parseInt(id || "");
      if (isNaN(matriculeNumber)) {
        setErrorMsg("Le matricule doit être un nombre valide");
        setLoading(false);
        return;
      }

      let res;

      if (isEditing && editingTicketId) {
        // Update existing ticket
        res = await window.api.updateTicket({
          id: editingTicketId,
          nomPrenom: form.nomPrenom.trim(),
          nombre: Number(form.nombre),
          typeTicket: form.typeTicket,
          offre: form.offre,
          restoration: form.restoration,
        });
      } else {
        // Add new ticket
        res = await window.api.addTicket({
          matricule: matriculeNumber,
          nomPrenom: form.nomPrenom.trim(),
          nombre: Number(form.nombre),
          typeTicket: form.typeTicket,
          offre: form.offre,
          restoration: form.restoration,
        });
      }

      if (res && res.success) {
        setSuccessMsg(
          isEditing
            ? "Ticket modifié avec succès !"
            : "Ticket ajouté avec succès !"
        );
        resetForm();
        await loadTickets();
      } else {
        setErrorMsg(
          res?.message ||
            `Erreur lors de ${isEditing ? "la modification" : "l'ajout"} du ticket.`
        );
      }
    } catch (err) {
      setErrorMsg(
        `Erreur lors de ${isEditing ? "la modification" : "l'ajout"} du ticket.${err}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    loadRestorations();
  }, [id, loadTickets]);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Return empty cleanup function when no messages
    return () => {};
  }, [successMsg, errorMsg]);

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.body",
        p: 2,
      }}
    >
      {/* Form Card */}
      <Card sx={{ width: "100%", maxWidth: 600, mb: 4 }}>
        <CardContent>
          <Typography level="h4" component="h2" sx={{ mb: 2 }}>
            {isEditing ? "Modifier le Ticket" : "Ajouter un Ticket"}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl required error={!!validationErrors.nomPrenom}>
                <FormLabel>Nom & prénom :</FormLabel>
                <Input
                  name="nomPrenom"
                  placeholder="Nom & prénom"
                  value={form.nomPrenom}
                  onChange={handleChange}
                />
                {validationErrors.nomPrenom && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.nomPrenom}
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!!validationErrors.nombre}>
                <FormLabel>Nombre de personnes :</FormLabel>
                <Input
                  name="nombre"
                  type="number"
                  placeholder="Nombre de personnes"
                  slotProps={{ input: { min: 1 } }}
                  value={form.nombre}
                  onChange={handleChange}
                />
                {validationErrors.nombre && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.nombre}
                  </Typography>
                )}
              </FormControl>

              <FormControl required>
                <FormLabel>Type de Ticket :</FormLabel>
                <RadioGroup
                  name="typeTicket"
                  orientation="vertical"
                  value={form.typeTicket}
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setForm({ ...form, typeTicket: value });
                  }}
                >
                  <Radio value="subventionne" label="Subventionné" />
                  <Radio value="non subventionne" label="Non subventionné" />
                </RadioGroup>
              </FormControl>

              <FormControl required>
                <FormLabel>Offre :</FormLabel>
                <RadioGroup
                  name="offre"
                  orientation="vertical"
                  value={form.offre}
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setForm({ ...form, offre: value });
                  }}
                >
                  <Radio value="self-service" label="Self-service" />
                  <Radio value="Sandwitch" label="Sandwich" />
                </RadioGroup>
              </FormControl>

              <FormControl required error={!!validationErrors.restoration}>
                <FormLabel>Restauration :</FormLabel>
                <Select
                  placeholder="Sélectionner une restauration"
                  value={form.restoration}
                  onChange={(_, value) =>
                    handleSelectChange("restoration", value)
                  }
                >
                  {restorations.map((resto) => (
                    <Option key={resto.id} value={resto.id.toString()}>
                      {resto.nom}
                    </Option>
                  ))}
                </Select>
                {validationErrors.restoration && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.restoration}
                  </Typography>
                )}
              </FormControl>

              {successMsg && (
                <Typography color="success" level="body-sm">
                  {successMsg}
                </Typography>
              )}
              {errorMsg && (
                <Typography color="danger" level="body-sm">
                  {errorMsg}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  color="primary"
                  variant="solid"
                  loading={loading}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {isEditing ? "Modifier" : "Ajouter"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    color="neutral"
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                )}
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card sx={{ width: "100%", maxWidth: 1000 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography level="h4" component="h2">
              Mes Tickets
            </Typography>
            <Typography level="body-sm" color="neutral">
              Total: {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {tickets.length === 0 ? (
            <Typography level="body-md" sx={{ textAlign: "center", py: 4 }}>
              Aucun ticket trouvé pour ce matricule.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table hoverRow>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom & Prénom</th>
                    <th>Nombre</th>
                    <th>Type</th>
                    <th>Offre</th>
                    <th>Restauration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.id}</td>
                      <td>{ticket.nomPrenom}</td>
                      <td>{ticket.nombre}</td>
                      <td>
                        <Typography
                          level="body-sm"
                          color={
                            ticket.typeTicket === "subventionne"
                              ? "success"
                              : "warning"
                          }
                        >
                          {ticket.typeTicket === "subventionne"
                            ? "Subventionné"
                            : "Non subventionné"}
                        </Typography>
                      </td>
                      <td>{ticket.offre}</td>
                      <td>
                        {ticket.restoration
                          ? getRestorationName(ticket.restoration)
                          : "-"}
                      </td>

                      <td>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEdit(ticket)}
                            disabled={loading}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleDeleteClick(ticket.id)}
                            disabled={loading}
                          >
                            Supprimer
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <Divider />
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est
            irréversible.
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={handleDeleteConfirm}
              loading={loading}
            >
              Supprimer
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={handleDeleteCancel}
              disabled={loading}
            >
              Annuler
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default MyTicket;
