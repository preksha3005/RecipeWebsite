import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import LoginApp from './components/LoginApp'
import SignUp from './components/SignUp'
import HomeUser from './components/HomeUser'
import MyRecipes from './components/MyRecipes'
import CreateRecipe from './components/CreateRecipe'
import ViewRecipe from './components/ViewRecipe'
import EditRecipe from './components/EditRecipe'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/sign" element={<SignUp />}></Route>
      <Route path="/loginapp" element={<LoginApp />}></Route>
      <Route path="/homeuser" element={<HomeUser />}></Route>
      <Route path="/my-recipes" element={<MyRecipes />}></Route>
      <Route path='/createrecipe' element={<CreateRecipe/>}></Route>
      <Route path='/viewrecipe/:id' element={<ViewRecipe/>}></Route>
      <Route path='/editrecipe/:id' element={<EditRecipe/>}></Route>
    </Routes>
</BrowserRouter>
    </div>
  );
}

export default App;
