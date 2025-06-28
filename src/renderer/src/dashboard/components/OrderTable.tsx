import Table from "@mui/joy/Table";
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";

const rows = [
  {
    id: 2,
    matricule: "12345",
    nomPrenom: "emna",
    nombre: 3,
    typeTicket: "subventionne",
    restauration: "Carthage Land",
    offre: "Sandwitch",
  },
  {
    id: 4,
    matricule: "123689",
    nomPrenom: "amani ben miled",
    nombre: 2,
    typeTicket: "Non subventionne",
    restauration: "Aqualand",
    offre: "Sandwitch",
  },
  {
    id: 5,
    matricule: "58774",
    nomPrenom: "ahmed hmida",
    nombre: 4,
    typeTicket: "Non subventionne",
    restauration: "King Kong",
    offre: "self",
  },
];

export default function OrderTable() {
  return (
    <Table
      aria-labelledby="tableTitle"
      stickyHeader
      hoverRow
      sx={{
        "--TableCell-headBackground": "var(--joy-palette-background-level1)",
        "--Table-headerUnderlineThickness": "1px",
        "--TableRow-hoverBackground": "var(--joy-palette-background-level1)",
        "--TableCell-paddingY": "4px",
        "--TableCell-paddingX": "8px",
        minWidth: 900,
      }}
    >
      <thead>
        <tr>
          <th style={{ width: 60, padding: "12px 6px" }}>Id</th>
          <th style={{ width: 120, padding: "12px 6px" }}>Matricule</th>
          <th style={{ width: 180, padding: "12px 6px" }}>Nom & Prenom</th>
          <th style={{ width: 80, padding: "12px 6px" }}>Nombre</th>
          <th style={{ width: 160, padding: "12px 6px" }}>Type de Ticket</th>
          <th style={{ width: 160, padding: "12px 6px" }}>Restauration</th>
          <th style={{ width: 120, padding: "12px 6px" }}>Offre</th>
          <th style={{ width: 160, padding: "12px 6px" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.matricule}</td>
            <td>{row.nomPrenom}</td>
            <td>{row.nombre}</td>
            <td>{row.typeTicket}</td>
            <td>{row.restauration}</td>
            <td>{row.offre}</td>
            <td>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Link component="button" sx={{ color: "#1976d2" }}>
                  Supprimer
                </Link>
                <Link component="button" sx={{ color: "#1976d2" }}>
                  Modifier
                </Link>
              </Box>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
