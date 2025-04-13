import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getAllOrders, getCartInfo } from "../../services/cartService";

const MAX_PRODUCTS = 15;
const NAME_LIMIT = 15;

const OrderStats = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByProduct, setRevenueByProduct] = useState([]);
  const [ordersByWaiter, setOrdersByWaiter] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await getAllOrders();
        let productStats = {};
        let waiterStats = {};

        for (const order of orders) {
          const details = await getCartInfo(order.id_pedido);
          
          details.forEach(({ id_producto, nombre, precio, cantidad, nombre_mozo }) => {
            if (!productStats[id_producto]) {
              productStats[id_producto] = { nombre, cantidad: 0, total: 0 };
            }
            productStats[id_producto].cantidad += cantidad;
            productStats[id_producto].total += parseFloat(precio) * cantidad;

            if (!waiterStats[nombre_mozo]) {
              waiterStats[nombre_mozo] = 0;
            }
            waiterStats[nombre_mozo] += 1;
          });
        }

        const sortedByQuantity = Object.values(productStats).sort((a, b) => b.cantidad - a.cantidad).slice(0, MAX_PRODUCTS);
        const sortedByRevenue = Object.values(productStats).sort((a, b) => b.total - a.total).slice(0, MAX_PRODUCTS);

        setTopProducts(sortedByQuantity.map(p => ({ ...p, nombre: p.nombre.length > NAME_LIMIT ? p.nombre.substring(0, NAME_LIMIT) + "..." : p.nombre })));
        setRevenueByProduct(sortedByRevenue.map(p => ({ ...p, nombre: p.nombre.length > NAME_LIMIT ? p.nombre.substring(0, NAME_LIMIT) + "..." : p.nombre })));
        setOrdersByWaiter(
          Object.entries(waiterStats).map(([mozo, count]) => ({ nombre: mozo, pedidos: count }))
        );
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Productos más vendidos</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProducts} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Ingresos por producto</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueByProduct} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Pedidos por mozo</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ordersByWaiter} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="pedidos" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OrderStats;
