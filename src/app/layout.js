'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, CssBaseline, Menu, MenuItem, IconButton } from '@mui/material';
import Link from 'next/link';
import KitchenIcon from '@mui/icons-material/Kitchen';
import React, { useState } from 'react';
import theme from '../theme'; 

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Pantry Tracker",
//   description: "A simple pantry tracker app. - By: Aishah Mabayoje",
// };

export default function RootLayout({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
            
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
                sx={{ mr: 2 }}
              >
                <KitchenIcon />
              </IconButton>
              <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Pantry Tracker
              </Typography>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} href="/">Pantry</MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/recipes">Recipes</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}