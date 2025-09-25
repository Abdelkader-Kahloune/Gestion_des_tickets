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
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import { useEffect, useState } from "react";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";

interface Ticket {
  id: number;
  matricule: number;
  nomPrenom: string;
  nombre: number;
  typeTicket: string;
  offre: string;
  restoration?: string;
  created_at: string;
}

interface Restoration {
  id: number;
  nom: string;
}

export default function OrderTable() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [restorations, setRestorations] = useState<Restoration[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nomPrenom: "",
    nombre: 1,
    typeTicket: "subventionne",
    offre: "self-service",
    restoration: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Restoration management states
  const [restorationModalOpen, setRestorationModalOpen] = useState(false);
  const [addRestorationModalOpen, setAddRestorationModalOpen] = useState(false);
  const [editRestorationModalOpen, setEditRestorationModalOpen] =
    useState(false);
  const [deleteRestorationModalOpen, setDeleteRestorationModalOpen] =
    useState(false);
  const [selectedRestoration, setSelectedRestoration] =
    useState<Restoration | null>(null);
  const [restorationForm, setRestorationForm] = useState({ nom: "" });
  const [restorationErrors, setRestorationErrors] = useState<{
    [key: string]: string;
  }>({});

  const loadTickets = async () => {
    try {
      const tickets = await window.api.getTickets();
      console.log("Raw tickets data:", tickets);

      // Process tickets to ensure restoration field is properly handled
      const processedTickets = tickets.map((ticket: any) => {
        let restorationName = "";

        if (ticket.restoration) {
          // Check if restoration is an ID (number) or name (string)
          if (
            typeof ticket.restoration === "number" ||
            (typeof ticket.restoration === "string" &&
              !isNaN(Number(ticket.restoration)))
          ) {
            // It's an ID, convert to name
            const restoration = restorations.find(
              (r) => r.id === Number(ticket.restoration)
            );
            restorationName = restoration ? restoration.nom : "";
          } else {
            // It's already a name
            restorationName = ticket.restoration;
          }
        }

        return {
          ...ticket,
          restoration: restorationName,
        };
      });

      console.log("Processed tickets:", processedTickets);
      setRows(processedTickets);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
    }
  };

  const loadRestorations = async () => {
    try {
      const restorationsData = await window.api.getRestorations();
      console.log("Loaded restorations:", restorationsData);
      setRestorations(restorationsData);
    } catch (error) {
      console.error("Erreur lors du chargement des restaurations:", error);
    }
  };

  // Load restorations first, then tickets
  useEffect(() => {
    const loadData = async () => {
      await loadRestorations();
    };
    loadData();
  }, []);

  // Load tickets after restorations are loaded
  useEffect(() => {
    if (restorations.length > 0) {
      loadTickets();
    }
  }, [restorations]);

  const handleDeleteClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (ticket: Ticket) => {
    console.log("Editing ticket:", ticket);
    setSelectedTicket(ticket);

    // Ensure restoration is properly set
    const restorationValue = ticket.restoration || "";

    setEditForm({
      nomPrenom: ticket.nomPrenom,
      nombre: ticket.nombre,
      typeTicket: ticket.typeTicket,
      offre: ticket.offre,
      restoration: restorationValue,
    });

    console.log("Edit form set to:", {
      nomPrenom: ticket.nomPrenom,
      nombre: ticket.nombre,
      typeTicket: ticket.typeTicket,
      offre: ticket.offre,
      restoration: restorationValue,
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
        await loadTickets();
        setDeleteModalOpen(false);
        setSelectedTicket(null);
      } else {
        alert(result.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
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

    console.log("Submitting edit form:", editForm);
    setLoading(true);
    try {
      const updateData = {
        id: selectedTicket.id,
        nomPrenom: editForm.nomPrenom.trim(),
        nombre: editForm.nombre,
        typeTicket: editForm.typeTicket,
        offre: editForm.offre,
        restoration: editForm.restoration || undefined,
      };

      console.log("Update data being sent:", updateData);
      const result = await window.api.updateTicket(updateData);
      console.log("Update result:", result);

      if (result.success) {
        await loadTickets();
        setEditModalOpen(false);
        setSelectedTicket(null);
        setEditForm({
          nomPrenom: "",
          nombre: 1,
          typeTicket: "subventionne",
          offre: "self-service",
          restoration: "",
        });
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
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

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handleEditSelectChange = (name: string, value: string | null) => {
    console.log(`Setting ${name} to:`, value);
    setEditForm({ ...editForm, [name]: value || "" });

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  // Restoration management functions
  const validateRestorationForm = () => {
    const errors: { [key: string]: string } = {};

    if (!restorationForm.nom.trim()) {
      errors.nom = "Le nom de la restauration est requis";
    } else if (restorationForm.nom.trim().length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    const existingRestoration = restorations.find(
      (r) =>
        r.nom.toLowerCase() === restorationForm.nom.trim().toLowerCase() &&
        (!selectedRestoration || r.id !== selectedRestoration.id)
    );
    if (existingRestoration) {
      errors.nom = "Une restauration avec ce nom existe déjà";
    }

    setRestorationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRestoration = async () => {
    if (!validateRestorationForm()) return;

    setLoading(true);
    try {
      const result = await window.api.addRestoration({
        nom: restorationForm.nom.trim(),
      });

      if (result.success) {
        await loadRestorations();
        setAddRestorationModalOpen(false);
        setRestorationForm({ nom: "" });
        setRestorationErrors({});
      } else {
        alert(result.message || "Erreur lors de l'ajout de la restauration");
      }
    } catch (error) {
      console.error("Error adding restoration:", error);
      alert("Erreur lors de l'ajout de la restauration");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketsWithNewRestorationName = async (
    oldName: string,
    newName: string
  ) => {
    const ticketsToUpdate = rows.filter(
      (ticket) => ticket.restoration === oldName
    );

    for (const ticket of ticketsToUpdate) {
      try {
        await window.api.updateTicket({
          id: ticket.id,
          nomPrenom: ticket.nomPrenom,
          nombre: ticket.nombre,
          typeTicket: ticket.typeTicket,
          offre: ticket.offre,
          restoration: newName,
        });
      } catch (error) {
        console.error(`Error updating ticket ${ticket.id}:`, error);
      }
    }
  };

  const clearRestorationFromTickets = async (restorationName: string) => {
    const ticketsToUpdate = rows.filter(
      (ticket) => ticket.restoration === restorationName
    );

    for (const ticket of ticketsToUpdate) {
      try {
        await window.api.updateTicket({
          id: ticket.id,
          nomPrenom: ticket.nomPrenom,
          nombre: ticket.nombre,
          typeTicket: ticket.typeTicket,
          offre: ticket.offre,
          restoration: undefined,
        });
      } catch (error) {
        console.error(
          `Error clearing restaurant from ticket ${ticket.id}:`,
          error
        );
      }
    }
  };

  const handleEditRestoration = async () => {
    if (!selectedRestoration || !validateRestorationForm()) return;

    setLoading(true);
    try {
      const oldName = selectedRestoration.nom;
      const newName = restorationForm.nom.trim();

      console.log("Updating restoration:", {
        id: selectedRestoration.id,
        oldName,
        newName,
      });

      const result = await window.api.updateRestoration({
        id: selectedRestoration.id,
        nom: newName,
      });

      console.log("Update result:", result);

      if (result.success) {
        if (oldName !== newName) {
          await updateTicketsWithNewRestorationName(oldName, newName);
        }

        await loadRestorations();
        await loadTickets();

        setEditRestorationModalOpen(false);
        setSelectedRestoration(null);
        setRestorationForm({ nom: "" });
        setRestorationErrors({});
      } else {
        console.error("Update failed:", result.message);
        alert(
          result.message || "Erreur lors de la modification de la restauration"
        );
      }
    } catch (error) {
      console.error("Error updating restoration:", error);
      alert("Erreur lors de la modification de la restauration");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestoration = async () => {
    if (!selectedRestoration) return;

    setLoading(true);
    try {
      const result = await window.api.deleteRestoration(selectedRestoration.id);

      if (result.success) {
        await clearRestorationFromTickets(selectedRestoration.nom);
        await loadRestorations();
        await loadTickets();

        setDeleteRestorationModalOpen(false);
        setSelectedRestoration(null);
      } else {
        alert(
          result.message || "Erreur lors de la suppression de la restauration"
        );
      }
    } catch (error) {
      console.error("Error deleting restoration:", error);
      alert("Erreur lors de la suppression de la restauration");
    } finally {
      setLoading(false);
    }
  };

  const openEditRestorationModal = (restoration: Restoration) => {
    console.log("Opening edit modal for restoration:", restoration);
    setSelectedRestoration(restoration);
    setRestorationForm({ nom: restoration.nom });
    setRestorationErrors({});
    setEditRestorationModalOpen(true);
  };

  const openDeleteRestorationModal = (restoration: Restoration) => {
    setSelectedRestoration(restoration);
    setDeleteRestorationModalOpen(true);
  };

  const openAddRestorationModal = () => {
    setRestorationForm({ nom: "" });
    setRestorationErrors({});
    setAddRestorationModalOpen(true);
  };

  const handleRestorationFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setRestorationForm({ nom: value });

    if (restorationErrors.nom) {
      setRestorationErrors({ ...restorationErrors, nom: "" });
    }
  };

  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography level="h4">Gestion des Tickets</Typography>
        <Button
          startDecorator={<Settings />}
          variant="outlined"
          color="neutral"
          onClick={() => setRestorationModalOpen(true)}
        >
          Gérer les Restaurations
        </Button>
      </Box>

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
                <td>
                  <Typography level="body-sm">
                    {row.restoration || "Aucune"}
                  </Typography>
                </td>
                <td>
                  <Typography level="body-sm">
                    {row.offre === "self-service"
                      ? "Self-service"
                      : row.offre === "sandwich" || row.offre === "Sandwitch"
                        ? "Sandwich"
                        : row.offre}
                  </Typography>
                </td>
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
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <Typography level="body-md" color="neutral">
                    Aucun ticket trouvé
                  </Typography>
                </td>
              </tr>
            )}
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

              <FormControl>
                <FormLabel>Restauration :</FormLabel>
                <Select
                  placeholder="Choisir une restauration"
                  value={editForm.restoration}
                  onChange={(_, value) => {
                    console.log("Restaurant selected:", value);
                    handleEditSelectChange("restoration", value);
                  }}
                >
                  <Option value="">Aucune</Option>
                  {restorations.map((resto) => (
                    <Option key={resto.id} value={resto.nom}>
                      {resto.nom}
                    </Option>
                  ))}
                </Select>
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

      {/* Restoration Management Modal */}
      <Modal
        open={restorationModalOpen}
        onClose={() => setRestorationModalOpen(false)}
      >
        <ModalDialog sx={{ width: 600 }}>
          <ModalClose />
          <DialogTitle>Gestion des Restaurations</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="title-sm">
                  Restaurations disponibles :
                </Typography>
                <Button
                  startDecorator={<Plus />}
                  size="sm"
                  onClick={openAddRestorationModal}
                >
                  Ajouter
                </Button>
              </Box>

              {restorations.length === 0 ? (
                <Typography
                  level="body-md"
                  color="neutral"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  Aucune restauration trouvée
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {restorations.map((resto) => (
                    <Box
                      key={resto.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "md",
                      }}
                    >
                      <Typography level="body-md">{resto.nom}</Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="primary"
                          onClick={() => openEditRestorationModal(resto)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => openDeleteRestorationModal(resto)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setRestorationModalOpen(false)}
            >
              Fermer
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Add Restoration Modal */}
      <Modal
        open={addRestorationModalOpen}
        onClose={() => setAddRestorationModalOpen(false)}
      >
        <ModalDialog sx={{ width: 400 }}>
          <ModalClose />
          <DialogTitle>Ajouter une Restauration</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl required error={!!restorationErrors.nom}>
                <FormLabel>Nom de la restauration :</FormLabel>
                <Input
                  placeholder="Nom de la restauration"
                  value={restorationForm.nom}
                  onChange={handleRestorationFormChange}
                />
                {restorationErrors.nom && (
                  <Typography color="danger" level="body-sm">
                    {restorationErrors.nom}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAddRestoration}
              loading={loading}
              variant="solid"
              color="primary"
            >
              Ajouter
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setAddRestorationModalOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Edit Restoration Modal */}
      <Modal
        open={editRestorationModalOpen}
        onClose={() => setEditRestorationModalOpen(false)}
      >
        <ModalDialog sx={{ width: 400 }}>
          <ModalClose />
          <DialogTitle>Modifier la Restauration</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl required error={!!restorationErrors.nom}>
                <FormLabel>Nom de la restauration :</FormLabel>
                <Input
                  placeholder="Nom de la restauration"
                  value={restorationForm.nom}
                  onChange={handleRestorationFormChange}
                />
                {restorationErrors.nom && (
                  <Typography color="danger" level="body-sm">
                    {restorationErrors.nom}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleEditRestoration}
              loading={loading}
              variant="solid"
              color="primary"
            >
              Sauvegarder
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setEditRestorationModalOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Delete Restoration Modal */}
      <Modal
        open={deleteRestorationModalOpen}
        onClose={() => setDeleteRestorationModalOpen(false)}
      >
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer la restauration{" "}
            <strong>{selectedRestoration?.nom}</strong> ?
            <br />
            <Typography color="warning" level="body-sm" sx={{ mt: 1 }}>
              ⚠️ Cette action supprimera également toutes les références à cette
              restauration dans les tickets existants.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={handleDeleteRestoration}
              loading={loading}
            >
              Supprimer
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setDeleteRestorationModalOpen(false)}
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
