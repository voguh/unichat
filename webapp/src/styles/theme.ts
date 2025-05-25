import { createTheme } from "@mui/material/styles";

export const themeDark = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark"
  },
  typography: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700
  }
});
