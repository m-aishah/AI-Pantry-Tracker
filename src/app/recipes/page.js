'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, TextField, CircularProgress, Card, Divider, IconButton, List, ListItem, Modal, Checkbox, FormControlLabel, Chip, Stack, Collapse } from "@mui/material";
import { Delete as DeleteIcon, KitchenOutlined as KitchenIcon, Shuffle as ShuffleIcon, Search as SearchIcon, ListAlt as ListAltIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [pantryItems, setPantryItems] = useState([]);
  const [openPantryModal, setOpenPantryModal] = useState(false);
  const [selectedPantryItems, setSelectedPantryItems] = useState([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);


  const fetchRecipes = async () => {
    const snapshot = query(collection(firestore, 'recipes'));
    const docs = await getDocs(snapshot);
    const recipeList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecipes(recipeList);
  };

  useEffect(() => {
    const fetchPantryItems = async () => {
      const snapshot = await getDocs(collection(firestore, 'pantry'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, name: doc.id, ...doc.data() }));
      setPantryItems(items);
    };
    fetchPantryItems();
    fetchRecipes(); 
  }, []);

  const generateRecipe = async (ingredientList) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientList }),
      });
      const data = await response.json();
      setGeneratedRecipe(data.recipe);
    } catch (error) {
      console.error('Failed to generate recipe:', error);
    }
    setLoading(false);
  };

  const handleManualGenerate = () => {
    generateRecipe(ingredients.map(i => i.trim()));
  };

  const handlePantryGenerate = () => {
    setOpenPantryModal(true);
  };

  const handleSurpriseMe = () => {
    generateRecipe(['surprise me']);
  };

  const handlePantryModalClose = () => {
    setOpenPantryModal(false);
  };

  const handlePantryItemSelect = (itemId) => {
    setSelectedPantryItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleGenerateFromPantry = () => {
    const selectedIngredients = pantryItems
      .filter(item => selectedPantryItems.includes(item.id))
      .map(item => item.name);
    generateRecipe(selectedIngredients);
    setOpenPantryModal(false);
  };

  const saveRecipe = async () => {
    if (generatedRecipe) {
      await addDoc(collection(firestore, 'recipes'), {
        title: generatedRecipe.title,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        createdAt: serverTimestamp(),
      });
      fetchRecipes();
      setGeneratedRecipe(null);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    await deleteDoc(doc(firestore, 'recipes', recipeId));
    fetchRecipes();
  };

  const handleAddIngredient = () => {
    if (ingredient.trim() !== '' && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient('');
    }
  };

  const handleDeleteIngredient = (ingredientToDelete) => {
    setIngredients((ingredients) => ingredients.filter((ingredient) => ingredient !== ingredientToDelete));
  };

  const handleExpandClick = (recipeId) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gap={2} gutterBottom>
        Recipes
      </Typography>
      <Box mb={4}>
        <Stack direction="row" spacing={1} mb={2}>
          <TextField
            label="Add Ingredient"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
          />
          <Button variant="contained" onClick={handleAddIngredient}>
            Add
          </Button>
        </Stack>
        <Box mb={2}>
          {ingredients.map((ingredient, index) => (
            <Chip
              key={index}
              label={ingredient}
              onDelete={() => handleDeleteIngredient(ingredient)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button onClick={handleManualGenerate} disabled={loading || ingredients.length === 0} startIcon={<SearchIcon />} variant="outlined">
            Generate Recipe
          </Button>
          <Button onClick={handlePantryGenerate} startIcon={<ListAltIcon />} variant="outlined">
            From Pantry
          </Button>
          <Button onClick={handleSurpriseMe} startIcon={<ShuffleIcon />} variant="outlined">
            Surprise Me
          </Button>
        </Box>
      </Box>

      {loading && <CircularProgress />}

      {generatedRecipe && (
        <Card sx={{ mb: 4, p: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {generatedRecipe.title.replace(/\*\*/g, '')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Ingredients:</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
            {generatedRecipe.ingredients}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Instructions:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {generatedRecipe.instructions}
          </Typography>
          <Box mt={2}>
            <Button size="small" onClick={saveRecipe}>Save Recipe</Button>
            <Button size="small" onClick={() => setGeneratedRecipe(null)}>Discard</Button>
          </Box>
        </Card>
      )}

        <Box display="flex" alignItems="center" mb={2}>
            <ListAltIcon fontSize="large" color="primary" />
            <Typography variant="h5" component="h2" gutterBottom sx={{ ml: 1 }}>
            Saved Recipes
            </Typography>
        </Box>
      {recipes.map((recipe) => (
        <Card key={recipe.id} sx={{ mb: 2, p: 2, backgroundColor: '#f9fbe7', borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {recipe.title.replace(/\*\*/g, '')}
            </Typography>
            <IconButton onClick={() => handleExpandClick(recipe.id)}>
              {expandedRecipeId === recipe.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedRecipeId === recipe.id} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ingredients:
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {recipe.ingredients}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {recipe.instructions.split('\n').map((instruction, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  {instruction}
                </div>
              ))}
            </Typography>
            <Box mt={2} textAlign="center">
              <IconButton onClick={() => handleDeleteRecipe(recipe.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Collapse>
        </Card>
      ))}

      <Modal
        open={openPantryModal}
        onClose={handlePantryModalClose}
        aria-labelledby="pantry-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Select Ingredients from Pantry
          </Typography>
          <List>
            {pantryItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPantryItems.includes(item.id)}
                      onChange={() => handlePantryItemSelect(item.id)}
                    />
                  }
                  label={item.name}
                />
              </ListItem>
            ))}
          </List>
          <Box textAlign="center" mt={2}>
            <Button onClick={handleGenerateFromPantry} variant="contained">Generate Recipe</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
