import Table from "@mui/joy/Table";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import RadioGroup from "@mui/joy/RadioGroup";
import Radio from "@mui/joy/Radio";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";

interface Ticket {
  id: number;
  matricule: number;
  nomPrenom: string;
  nombre: number;
  typeTicket: string;
  offre: string;
  created_at: string;
}

export default function OrderTable() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nomPrenom: "",
    nombre: 1,
    typeTicket: "subventionne",
    offre: "self-service",
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const loadTickets = () => {
    window.api.getTickets().then((tickets) => {
      setRows(tickets);
    });
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleDeleteClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      nomPrenom: ticket.nomPrenom,
      nombre: ticket.nombre,
      typeTicket: ticket.typeTicket,
      offre: ticket.offre,
    });
    setValidationErrors({});
    setEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTicket) return;

    setLoading(true);
    try {
      const result = await window.api.deleteTicketById(selectedTicket.id);
      if (result.success) {
        loadTickets(); // Refresh the table
        setDeleteModalOpen(false);
        setSelectedTicket(null);
      } else {
        alert(result.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const validateEditForm = () => {
    const errors: { [key: string]: string } = {};

    if (!editForm.nomPrenom.trim()) {
      errors.nomPrenom = "Le nom et prénom sont requis";
    } else if (editForm.nomPrenom.trim().length < 2) {
      errors.nomPrenom =
        "Le nom et prénom doivent contenir au moins 2 caractères";
    }

    if (editForm.nombre < 1 || editForm.nombre > 10) {
      errors.nombre = "Le nombre doit être entre 1 et 10";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!selectedTicket || !validateEditForm()) return;

    setLoading(true);
    try {
      const result = await window.api.updateTicket({
        id: selectedTicket.id,
        nomPrenom: editForm.nomPrenom.trim(),
        nombre: editForm.nombre,
        typeTicket: editForm.typeTicket,
        offre: editForm.offre,
      });

      if (result.success) {
        loadTickets(); // Refresh the table
        setEditModalOpen(false);
        setSelectedTicket(null);
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "nombre") {
      const numberValue = parseInt(value) || 1;
      setEditForm({ ...editForm, [name]: numberValue });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  return (
    <>
      <Box sx={{ overflowX: "auto" }}>
        <Table hoverRow>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th>Nombre</th>
              <th>Type de Ticket</th>
              <th>Restauration</th>
              <th>Offre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.matricule}</td>
                <td>{row.nomPrenom}</td>
                <td>{row.nombre}</td>
                <td>
                  <Typography
                    level="body-sm"
                    color={
                      row.typeTicket === "subventionne" ? "success" : "warning"
                    }
                  >
                    {row.typeTicket === "subventionne"
                      ? "Subventionné"
                      : "Non subventionné"}
                  </Typography>
                </td>
                <td>{row.restauration || ""}</td>
                <td>{row.offre}</td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditClick(row)}
                      disabled={loading}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="danger"
                      onClick={() => handleDeleteClick(row)}
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

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer le ticket de{" "}
            <strong>{selectedTicket?.nomPrenom}</strong> ?
            <br />
            Cette action est irréversible.
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
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalDialog sx={{ width: 500 }}>
          <ModalClose />
          <DialogTitle>Modifier le ticket</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl required error={!!validationErrors.nomPrenom}>
                <FormLabel>Nom & Prénom :</FormLabel>
                <Input
                  name="nomPrenom"
                  placeholder="Nom & prénom"
                  value={editForm.nomPrenom}
                  onChange={handleEditFormChange}
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
                  slotProps={{ input: { min: 1, max: 10 } }}
                  value={editForm.nombre}
                  onChange={handleEditFormChange}
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
                  value={editForm.typeTicket}
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setEditForm({ ...editForm, typeTicket: value });
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
                  value={editForm.offre}
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setEditForm({ ...editForm, offre: value });
                  }}
                >
                  <Radio value="self-service" label="Self-service" />
                  <Radio value="sandwich" label="Sandwich" />
                </RadioGroup>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleEditSubmit}
              loading={loading}
              variant="solid"
              color="primary"
            >
              Sauvegarder
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setEditModalOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
