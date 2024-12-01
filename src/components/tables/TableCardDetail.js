import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    IconButton,
    List,
    ListItem,
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { updateNotifications } from '../../services/waiterService';
import { putProductsAsOld } from '../../services/cartService'; // Asegúrate de que esta ruta sea correcta

const TableCardDetail = ({
    table,
    order = [],
    handleReceiveOrder,
    handleUpdateTableStatus,
    handleOrderInProgress,
    handleOpenDialog,
}) => {
    const [inProgressDisabled, setInProgressDisabled] = useState(false); // Estado para deshabilitar el botón "En curso"

    const validOrder = Array.isArray(order) ? order : [];

    // Formatear fecha de pedido
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(); // Cambia esto si quieres un formato específico
    };

    const handleOrderInProgressClick = (orderId, tableId) => {
        handleOrderInProgress(orderId, tableId);
        setInProgressDisabled(true); // Deshabilitar el botón "En curso" después de hacer clic
    };

    const handleClearNotifications = async () => {
        try {
            await updateNotifications(table.n_mesa);
            // Aquí puedes agregar lógica para manejar el estado o mostrar un mensaje de éxito
        } catch (error) {
            console.error('Error al borrar notificaciones:', error);
            // Manejar el error, quizás mostrar un mensaje de error al usuario
        }
    };

    const handleProductsAsOld = async () => {
        try {
            // Llamar al método putProductsAsOld con el id del último pedido
            await putProductsAsOld(table.ultimo_id_pedido);
            // Aquí puedes agregar lógica para manejar el estado o mostrar un mensaje de éxito
        } catch (error) {
            console.error('Error al actualizar productos a viejos:', error);
            // Manejar el error, quizás mostrar un mensaje de error al usuario
        }
    };

    const handleReceiveOrderClick = async () => {
        // Primero, llamar a la función handleReceiveOrder existente
        await handleReceiveOrder(table.ultimo_id_pedido, table.n_mesa);

        // Luego, marcar los productos como viejos
        await handleProductsAsOld();
    };

    // Filtrar productos actuales y viejos
    const currentProducts = validOrder.filter((item) => item.nuevo === 1);
    const oldProducts = validOrder.filter((item) => item.nuevo === 0);

    // Condiciones para habilitar o deshabilitar botones
    const isReceiveButtonDisabled = currentProducts.length === 0; // Deshabilitar si no hay productos nuevos
    const isClearNotificationsDisabled = table.callw === 0 && table.bill === 0; // Deshabilitar si callw y bill son 0

    return (
        <Card 
            sx={{ 
                margin: 1,
                border: table.callw === 1 || table.bill === 1 || currentProducts.length > 0 ? '2px solid yellow' : 'none',
                position: 'relative',
                animation: (table.callw === 1 || table.bill === 1 || currentProducts.length > 0) ? 'borderBlink 2s infinite' : 'none', // Cambiar a borderBlink
            }}
        >
            <style>
                {`
                    @keyframes borderBlink {
                        0% {
                            box-shadow: 0 0 10px yellow;
                        }
                        50% {
                            box-shadow: 0 0 20px yellow;
                        }
                        100% {
                            box-shadow: 0 0 10px yellow;
                        }
                    }

                    @keyframes textBlink {
                        0% {
                            color: yellow; 
                            text-shadow: 0 0 10px yellow, 0 0 20px yellow;
                        }
                        50% {
                            color: transparent; 
                            text-shadow: none; 
                        }
                        100% {
                            color: yellow; 
                            text-shadow: 0 0 10px yellow, 0 0 20px yellow;
                        }
                    }
                `}
            </style>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: table.estado === 'ocupada' ? 'rgba(139, 0, 0, 0.8)' : 'rgba(34, 139, 34, 0.8)',
                        color: '#fff',
                    }}
                >
                    <Typography align="center" variant="h6">
                        Mesa {table.n_mesa}
                        {table.callw === 1 && (
                            <span style={{ marginLeft: '10px', animation: 'textBlink 2s infinite', display: 'inline-block' }}>Mozo!</span>
                        )}
                        {table.bill === 1 && (
                            <span style={{ marginLeft: '10px', animation: 'textBlink 2s infinite', display: 'inline-block' }}>Cuenta!</span>
                        )}
                        {currentProducts.length > 0 && (
                            <span style={{ marginLeft: '10px', animation: 'textBlink 2s infinite', display: 'inline-block' }}>Nuevo!</span>
                        )}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <CardContent sx={{ padding: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Estado de la mesa: <strong>{table.estado}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Mozo: <strong>{table.nombre_mozo}</strong>
                        </Typography>
                        {validOrder.length > 0 && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Fecha y hora: <strong>{formatDate(validOrder[0].fecha_pedido)}</strong>
                            </Typography>
                        )}
                        <Divider sx={{ my: 2 }} />

                        {table.nota && (
                            <Typography variant="body2" sx={{ mb: 1, color: 'black' }}>
                                Nota: <strong>{table.nota}</strong>
                            </Typography>
                        )}

                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Pedido Actual:
                        </Typography>
                        <List>
                            {oldProducts.map((item) => (
                                <ListItem
                                    key={item.id_producto}
                                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                                >
                                    <Typography variant="body2">
                                        {item.nombre} - Cantidad: {item.cantidad} - Precio: ${item.precio}
                                    </Typography>
                                </ListItem>
                            ))}
                            <Divider />
                        </List>

                        {currentProducts.length > 0 && (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Productos Agregados:
                                </Typography>
                                <List>
                                    {currentProducts.map((item) => (
                                        <ListItem
                                            key={item.id_producto}
                                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                                        >
                                            <Typography variant="body2" color="green">
                                                {item.nombre} - Cantidad: {item.cantidad} - Precio: ${item.precio}
                                                <span style={{ color: 'orange', marginLeft: '10px' }}>Nuevo!</span>
                                            </Typography>
                                        </ListItem>
                                    ))}
                                    <Divider />
                                </List>
                            </>
                        )}
                    </CardContent>
                    <CardActions style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleReceiveOrderClick}
                            sx={{ mr: 1 }}
                            disabled={isReceiveButtonDisabled}
                        >
                            Confirmar
                        </Button>

                        <Button
                            variant="contained"
                            sx={{ backgroundColor: (order[0]?.estado_pedido === 'En curso' || inProgressDisabled) ? 'grey' : 'orange', color: '#fff' }}
                            onClick={() => handleOrderInProgressClick(table.ultimo_id_pedido, table.n_mesa)}
                            disabled={inProgressDisabled || order[0]?.estado_pedido === 'En curso'}
                        >
                            En Curso
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                handleUpdateTableStatus(table.n_mesa);
                                handleClearNotifications();
                            }}
                        >
                            Finalizar Pedido
                        </Button>

                        <IconButton
                            onClick={handleClearNotifications}
                            disabled={isClearNotificationsDisabled}
                            sx={{ color: isClearNotificationsDisabled ? 'grey' : 'red' }}
                        >
                            <NotificationsOffIcon />
                        </IconButton>

                        <IconButton onClick={() => handleOpenDialog(table)}>
                            <PersonAddIcon />
                        </IconButton>
                    </CardActions>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
};

export default TableCardDetail;
