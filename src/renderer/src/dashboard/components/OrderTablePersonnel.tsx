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
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";

interface Personnel {
  matricule: number;
  nom: string;
  login: string;
  email: string;
  adresse: string;
  mot_de_passe: string;
  role?: string;
}

import type React from "react";

export default function OrderTablePersonnel(): React.ReactElement {
  const [rows, setRows] = useState<Personnel[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: "",
    login: "",
    email: "",
    adresse: "",
    mot_de_passe: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const loadPersonnel = () => {
    window.api.getUsers().then((users) => {
      setRows(users);
    });
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const handleDeleteClick = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    setEditForm({
      nom: personnel.nom,
      login: personnel.login,
      email: personnel.email,
      adresse: personnel.adresse,
      mot_de_passe: personnel.mot_de_passe,
    });
    setValidationErrors({});
    setEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPersonnel) return;

    setLoading(true);
    try {
      const result = await window.api.deleteUser(selectedPersonnel.matricule);
      if (result.changes > 0) {
        loadPersonnel(); // Refresh the table
        setDeleteModalOpen(false);
        setSelectedPersonnel(null);
      } else {
        alert("Erreur lors de la suppression - utilisateur non trouvé");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const validateEditForm = () => {
    const errors: { [key: string]: string } = {};

    if (!editForm.nom.trim()) {
      errors.nom = "Le nom est requis";
    } else if (editForm.nom.trim().length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!editForm.login.trim()) {
      errors.login = "Le login est requis";
    } else if (editForm.login.trim().length < 3) {
      errors.login = "Le login doit contenir au moins 3 caractères";
    }

    if (!editForm.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!editForm.adresse.trim()) {
      errors.adresse = "L'adresse est requise";
    }

    if (!editForm.mot_de_passe.trim()) {
      errors.mot_de_passe = "Le mot de passe est requis";
    } else if (editForm.mot_de_passe.trim().length < 4) {
      errors.mot_de_passe =
        "Le mot de passe doit contenir au moins 4 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!selectedPersonnel || !validateEditForm()) return;

    setLoading(true);
    try {
      const result = await window.api.updateUser({
        matricule: selectedPersonnel.matricule,
        nom: editForm.nom.trim(),
        login: editForm.login.trim(),
        email: editForm.email.trim(),
        adresse: editForm.adresse.trim(),
        mot_de_passe: editForm.mot_de_passe.trim(),
      });

      if (result.changes > 0) {
        loadPersonnel(); // Refresh the table
        setEditModalOpen(false);
        setSelectedPersonnel(null);
      } else {
        alert("Erreur lors de la modification - utilisateur non trouvé");
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  return (
    <>
      <Box sx={{
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#9aa4b2 transparent",
          "&::-webkit-scrollbar": { height: { xs: 6, sm: 8 } },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9aa4b2",
            borderRadius: 9999,
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#7b8794" },
          "&::-webkit-scrollbar-thumb:active": { backgroundColor: "#5f6b7a" },
        }}>
                                   <Table hoverRow sx={{ width: 'max-content', minWidth: '100%', tableLayout: { xs: 'fixed', md: 'auto' }, '& th, & td': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', p: 1 } }}>
           <thead>
             <tr>
               <th style={{ width: 110 }}>Matricule</th>
               <th style={{ minWidth: 160 }}>Nom</th>
               <th style={{ minWidth: 140 }}>Login</th>
               <th style={{ minWidth: 220 }}>Email</th>
               <th style={{ minWidth: 220 }}>Adresse</th>
               <th style={{ width: 120 }}>Rôle</th>
               <th style={{ width: 160 }}>Actions</th>
             </tr>
           </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.matricule}>
                <td>{row.matricule}</td>
                <td>{row.nom}</td>
                <td>{row.login}</td>
                <td>{row.email}</td>
                <td>{row.adresse}</td>
                <td>
                  <Typography
                    level="body-sm"
                    color={row.role === "admin" ? "success" : "neutral"}
                  >
                    {row.role === "admin" ? "Administrateur" : "Utilisateur"}
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
                      disabled={loading || row.role === "admin"}
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
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur{" "}
            <strong>{selectedPersonnel?.nom}</strong> ?
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
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl required error={!!validationErrors.nom}>
                <FormLabel>Nom :</FormLabel>
                <Input
                  name="nom"
                  placeholder="Nom complet"
                  value={editForm.nom}
                  onChange={handleEditFormChange}
                />
                {validationErrors.nom && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.nom}
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!!validationErrors.login}>
                <FormLabel>Login :</FormLabel>
                <Input
                  name="login"
                  placeholder="Nom d'utilisateur"
                  value={editForm.login}
                  onChange={handleEditFormChange}
                />
                {validationErrors.login && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.login}
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!!validationErrors.email}>
                <FormLabel>Email :</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="adresse@email.com"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                />
                {validationErrors.email && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.email}
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!!validationErrors.adresse}>
                <FormLabel>Adresse :</FormLabel>
                <Input
                  name="adresse"
                  placeholder="Adresse complète"
                  value={editForm.adresse}
                  onChange={handleEditFormChange}
                />
                {validationErrors.adresse && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.adresse}
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!!validationErrors.mot_de_passe}>
                <FormLabel>Mot de passe :</FormLabel>
                <Input
                  name="mot_de_passe"
                  type="password"
                  placeholder="Mot de passe"
                  value={editForm.mot_de_passe}
                  onChange={handleEditFormChange}
                />
                {validationErrors.mot_de_passe && (
                  <Typography color="danger" level="body-sm">
                    {validationErrors.mot_de_passe}
                  </Typography>
                )}
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
