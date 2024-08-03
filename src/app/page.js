'use client'
import { Box, Container, Typography, Button, Modal, TextField, List, ListItem, ListItemText, IconButton, Paper, AppBar, Toolbar, InputAdornment, Menu, MenuItem, ThemeProvider, createTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CameraIcon from '@mui/icons-material/Camera';
import { CameraAlt as CameraAltIcon, FlipCameraAndroid as FlipCameraIcon } from '@mui/icons-material';
import {firestore} from "@/firebase";
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { Camera } from "react-camera-pro";


// Custom Theme (Pantry-like)
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Saddle Brown (wood-like color)
    },
    secondary: {
      main: '#F4A460', // Sandy Brown
    },
    background: {
      default: '#FFF8DC', // Cornsilk (light, warm background)
      paper: '#FFFAF0', // Floral White (slightly off-white for containers)
    },
    text: {
      primary: '#3E2723', // Dark Brown
      secondary: '#5D4037', // Brown
    },
  },
  typography: {
    fontFamily: '"Roboto Slab", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 5px 2px rgba(139, 69, 19, .15)',
        },
      },
    },
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

const cameraModalStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh'
};

const cameraBoxStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  height: 400,
  backgroundColor: 'black',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const shutterButtonStyle = {
  position: 'absolute',
  bottom: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
};

const flipButtonStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
};

const imagePreviewStyle = {
  width: '100%',
  maxWidth: 600,
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const cameraRef = useRef(null);

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

  const openCamera = () => setCameraOpen(true);
  const closeCamera = () => setCameraOpen(false);

  const takePhoto = () => {
    const imageSrc = cameraRef.current.takePhoto();
    setImage(imageSrc);
  };

  const retakePhoto = () => setImage(null);

  const confirmPhoto = () => {
    // Handle confirmed photo (e.g., upload, save, etc.)
    console.log('Photo confirmed:', image);
    closeCamera();
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <KitchenIcon sx={{ mr: 2 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Cozy Pantry Tracker
            </Typography>
            <Button color="inherit" onClick={() => setCameraOpen(true)} startIcon={<CameraIcon />}>
              Capture Item
            </Button>
            <Button color="inherit" onClick={() => setOpen(true)} startIcon={<AddIcon />}>
              Stock Item
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search pantry items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={handleFilterClick}
              startIcon={<FilterListIcon />}
              sx={{ mb: 2 }}
              color="secondary"
              variant="contained"
            >
              Sort Items
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
            <List>
              {filteredPantry.map(({name, count, note, addedAt}) => (
                <ListItem
                  key={name}
                  sx={{ 
                    bgcolor: 'background.default', 
                    mb: 1, 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(244, 164, 96, 0.1)' } 
                  }}
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
                      <IconButton edge="end" aria-label="delete" onClick={() => removeItem(name)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" color="text.primary">
                        {editItem === name ? 
                          <TextField 
                            value={name} 
                            onChange={(e) => editItemName(name, e.target.value)}
                            onBlur={() => setEditItem(null)}
                            autoFocus
                          /> : 
                          name.charAt(0).toUpperCase() + name.slice(1)
                        }
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          Quantity: {count}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Stocked: {addedAt ? new Date(addedAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                        </Typography>
                        <TextField
                          value={note || ''}
                          onChange={(e) => addNote(name, e.target.value)}
                          placeholder="Add a note"
                          variant="standard"
                          fullWidth
                          sx={{ mt: 1 }}
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
          <Box sx={{...modalStyle, bgcolor: 'background.paper'}}>
            <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom color="text.primary">
              Stock New Item
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
              Stock Item
            </Button>
          </Box>
        </Modal>
        
        <Modal open={cameraOpen} onClose={closeCamera}>
        <Box sx={cameraModalStyle}>
          {!image ? (
            <Box sx={cameraBoxStyle}>
              <Camera
                ref={cameraRef}
                facingMode={facingMode}
                aspectRatio="cover"
                style={{ width: '100%', height: '100%' }}
              />
              <IconButton sx={shutterButtonStyle} onClick={takePhoto}>
                <CameraAltIcon fontSize="large" />
              </IconButton>
              <IconButton sx={flipButtonStyle} onClick={switchCamera}>
                <FlipCameraIcon fontSize="large" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <img src={image} alt="Captured" style={imagePreviewStyle} />
              <Box sx={{ mt: 2 }}>
                <Button onClick={retakePhoto} color="secondary" variant="outlined">
                  Retake
                </Button>
                <Button onClick={confirmPhoto} color="primary" variant="contained" sx={{ ml: 2 }}>
                  Confirm
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
      </Box>
    </ThemeProvider>
  );
}