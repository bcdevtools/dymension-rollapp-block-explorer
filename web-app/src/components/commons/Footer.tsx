import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import packageJson from '@/../package.json';

const { version } = packageJson;

export default function Footer() {
  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Typography color="text.secondary" variant="subtitle2">
        © 2024 - Dr.BE v{version}
      </Typography>
    </Box>
  );
}
