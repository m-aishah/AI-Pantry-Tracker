'use client'
import { Box, Container, Typography, Button, Modal, TextField, List, ListItem, ListItemText, IconButton, Paper, AppBar, Toolbar, InputAdornment, Menu, MenuItem, ThemeProvider, createTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import {firestore} from "@/firebase";
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF69B4', // Hot pink
    },
    secondary: {
      main: '#FFB6C1', // Light pink
    },
    background: {
      default: '#FFF0F5', // Lavender blush
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setPantry(pantryList);
    setFilteredPantry(pantryList);
  };

  useEffect(() => {   
    updatePantry();
  }, []);

  useEffect(() => {
    const filtered = pantry.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPantry(filtered);
  }, [searchTerm, pantry]);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {count, note, addedAt} = docSnap.data();
      await setDoc(docRef, {
        count: count + 1, 
        note: note || itemNote, 
        addedAt: addedAt || serverTimestamp()
      });
    } else {
      await setDoc(docRef, {
        count: 1, 
        note: itemNote, 
        addedAt: serverTimestamp()
      });
    }
    await updatePantry();
    setOpen(false);
    setItemName('');
    setItemNote('');
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, {...docSnap.data(), count: count - 1});
      } else {
        await deleteDoc(docRef);
      }
    }
    await updatePantry();
  };

  const editItemName = async (oldName, newName) => {
    const oldDocRef = doc(collection(firestore, 'pantry'), oldName);
    const newDocRef = doc(collection(firestore, 'pantry'), newName.toLowerCase());
    const docSnap = await getDoc(oldDocRef);
    if (docSnap.exists()) {
      await setDoc(newDocRef, docSnap.data());
      await deleteDoc(oldDocRef);
    }
    await updatePantry();
    setEditItem(null);
  };

  const addNote = async (item, note) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await setDoc(docRef, { note }, { merge: true });
    await updatePantry();
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilter = (filter) => {
    let filtered;
    switch(filter) {
      case 'asc':
        filtered = [...pantry].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'desc':
        filtered = [...pantry].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'count':
        filtered = [...pantry].sort((a, b) => b.count - a.count);
        break;
      default:
        filtered = pantry;
    }
    setFilteredPantry(filtered);
    handleFilterClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Pantry Tracker
            </Typography>
            <Button color="inherit" onClick={() => setOpen(true)} startIcon={<AddIcon />}>
              Add Item
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, bgcolor: 'background.paper' }}
          />
          <Button
            onClick={handleFilterClick}
            startIcon={<FilterListIcon />}
            sx={{ mb: 2 }}
            color="secondary"
            variant="contained"
          >
            Filter
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilter('asc')}>Name (A-Z)</MenuItem>
            <MenuItem onClick={() => handleFilter('desc')}>Name (Z-A)</MenuItem>
            <MenuItem onClick={() => handleFilter('count')}>Quantity (High to Low)</MenuItem>
            <MenuItem onClick={() => handleFilter('date')}>Date Added (Newest First)</MenuItem>
          </Menu>
          <Paper elevation={3} sx={{ bgcolor: 'background.paper' }}>
            <List>
              {filteredPantry.map(({name, count, note, addedAt}) => (
                <ListItem
                  key={name}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="add" onClick={() => addItem(name)} color="primary">
                        <AddIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="remove" onClick={() => removeItem(name)} color="primary">
                        <RemoveIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="edit" onClick={() => setEditItem(name)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => removeItem(name)} color="primary">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={editItem === name ? 
                      <TextField 
                        value={name} 
                        onChange={(e) => editItemName(name, e.target.value)}
                        onBlur={() => setEditItem(null)}
                        autoFocus
                      /> : 
                      name.charAt(0).toUpperCase() + name.slice(1)
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Quantity: {count}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          Added: {addedAt ? new Date(addedAt.seconds * 1000).toLocaleString() : 'Unknown'}
                        </Typography>
                        <TextField
                          value={note || ''}
                          onChange={(e) => addNote(name, e.target.value)}
                          placeholder="Add a note"
                          variant="standard"
                          fullWidth
                        />
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
              Add New Item
            </Typography>
            <TextField 
              autoFocus
              margin="dense"
              id="name"
              label="Item Name"
              type="text"
              fullWidth
              variant="outlined"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField 
              margin="dense"
              id="note"
              label="Note (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
            />
            <Button 
              variant="contained" 
              onClick={() => addItem(itemName)}
              sx={{ mt: 2 }}
              fullWidth
              color="primary"
            >
              Add Item
            </Button>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}