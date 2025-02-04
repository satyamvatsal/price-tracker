import { useEffect, useState } from "react";
import {
  getProfile,
  addProduct,
  deleteProduct,
  logout,
  editProduct,
} from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Trash2,
  LogOut,
  Pencil,
  Send,
  SendHorizonal,
  CircleX,
} from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [productURL, setProductURL] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProfile();
      setProducts(data.products);
    } catch (error) {
      toast.error(error.response.data.error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (product) => {
    if (product === editingProduct) {
      setEditingProduct(null);
      setProductURL("");
      setTriggerPrice("");
      return;
    }
    setEditingProduct(product);
    setProductURL(product.productURL);
    setTriggerPrice(product.originalTriggerPrice);
  };
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const id = editingProduct.id;
    setLoading(true);
    try {
      const response = await editProduct(id, { productURL, triggerPrice });
      setEditingProduct(null);
      setProductURL("");
      setTriggerPrice("");
      console.log(response);
      toast.success(response.data.message);
      fetchProducts();
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addProduct({ productURL, triggerPrice });
      toast.success(response.data.message);
      setProducts([...products, response.data.product]);
    } catch (error) {
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteProduct(id);
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      toast.success("User Logout Successful");
      navigate("/login");
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-screen border-b-2">
      <LoadingOverlay loading={loading} />
      <div className=" mx-auto bg-white p-6 rounded-lg shadow-lg max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
          </button>
        </div>
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          className="bg-gray-50 p-4 rounded-lg shadow mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 max-w-screen">
            <input
              type="text"
              placeholder="Amazon Product URL"
              value={productURL}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 max-w-screen"
              onChange={(e) => setProductURL(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Trigger Price"
              value={triggerPrice}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 max-w-screen"
              onChange={(e) => setTriggerPrice(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition max-w-fit"
            >
              {editingProduct ? (
                <Send size={20} />
              ) : (
                <SendHorizonal size={20} />
              )}
            </button>
          </div>
        </form>

        <ul className="mt-6 space-y-4 max-w-screen">
          {products.length === 0 ? (
            <p className="text-gray-600 text-center">No products added yet.</p>
          ) : (
            products.map((product) => (
              <li
                key={product.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <div>
                  <p className="text-gray-800 font-semibold max-w-screen">
                    {product.productURL.length > 20
                      ? product.productURL.substring(0, 20) + "..."
                      : product.productURL}
                  </p>
                  <p className="text-gray-600">
                    Original Trigger Price: ₹{product.originalTriggerPrice}
                  </p>
                  <p className="text-gray-600">
                    Updated Trigger Price: ₹{product.updatedTriggerPrice}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition mb-3"
                  >
                    {product === editingProduct ? <CircleX /> : <Pencil />}
                  </button>
                  <a
                    href={product.productURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white mx-5 px-2 py-1 rounded-lg transition inline-block text-center mb-3"
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
