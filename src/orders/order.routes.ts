import { Router } from 'express';
import { isAdminClient, isIOSClient } from '../middleware/client-auth';

export function createOrderRouter(orderController: any) {
  const router = Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     OrderItem:
   *       type: object
   *       required:
   *         - flowerId
   *         - flowerName
   *         - price
   *         - quantity
   *       properties:
   *         flowerId:
   *           type: string
   *           description: Unique identifier for the flower
   *         flowerName:
   *           type: string
   *           description: Name of the flower
   *         price:
   *           type: number
   *           format: float
   *           description: Price per unit
   *         quantity:
   *           type: integer
   *           description: Number of units ordered
   *     Order:
   *       type: object
   *       required:
   *         - customerName
   *         - deliveryAddress
   *         - orderItems
   *         - totalAmount
   *         - status
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *           description: Unique identifier for the order
   *         customerName:
   *           type: string
   *           description: Name of the customer
   *         deliveryAddress:
   *           type: string
   *           description: Delivery address
   *         orderItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OrderItem'
   *         totalAmount:
   *           type: number
   *           format: float
   *           description: Total amount of the order
   *         status:
   *           type: string
   *           enum: [PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED]
   *           description: Current status of the order
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Order creation timestamp
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Last update timestamp
   *     PatchAdminOrder:
   *       type: object
   *       properties:
   *         status:
   *           type: string
   *           enum: [pending, confirmed, preparing, ready, delivered, cancelled]
   *           description: |
   *             New status for the order. Allowed transitions for Admin:
   *               - PENDING → CONFIRMED
   *               - CONFIRMED → PREPARING
   *               - PREPARING → READY
   *               - READY → DELIVERED
   *               - Any status → CANCELLED
   *       required:
   *         - status
   *     PatchIOSOrder:
   *       type: object
   *       properties:
   *         customerName:
   *           type: string
   *           description: New customer name (only allowed if order is PENDING)
   *         deliveryAddress:
   *           type: string
   *           description: New delivery address (only allowed if order is PENDING)
   *         orderItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OrderItem'
   *           description: New order items (only allowed if order is PENDING)
   *         status:
   *           type: string
   *           enum: [cancelled]
   *           description: Set to 'cancelled' to cancel a PENDING order
   *       description: |
   *         iOS users can update customerName, deliveryAddress, and orderItems if the order is still PENDING.
   *         They can also cancel a PENDING order by setting status to 'cancelled'.
   *       anyOf:
   *         - required: [customerName]
   *         - required: [deliveryAddress]
   *         - required: [orderItems]
   *         - required: [status]
   *     PostOrder:
   *       type: object
   *       required:
   *         - customerName
   *         - deliveryAddress
   *         - orderItems
   *         - totalAmount
   *       properties:
   *         customerName:
   *           type: string
   *           description: Name of the customer
   *         deliveryAddress:
   *           type: string
   *           description: Delivery address
   *         orderItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OrderItem'
   *           description: List of order items
   *         totalAmount:
   *           type: number
   *           format: float
   *           description: Total amount of the order
   *     OrderResponse:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *           description: Unique identifier for the order
   *         customerName:
   *           type: string
   *           description: Name of the customer
   *         deliveryAddress:
   *           type: string
   *           description: Delivery address
   *         orderItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OrderItem'
   *           description: List of order items
   *         totalAmount:
   *           type: number
   *           format: float
   *           description: Total amount of the order
   *         status:
   *           type: string
   *           enum: [pending, confirmed, preparing, ready, delivered, cancelled]
   *           description: Current status of the order
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Order creation timestamp
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Last update timestamp (updated on every change)
   *         deletedAt:
   *           type: string
   *           format: date-time
   *           nullable: true
   *           description: Soft delete timestamp (null if not deleted)
   */

  // Feature flags
  const FEATURES = {
    ORDER_FILTERING: process.env.ENABLE_ORDER_FILTERING === 'true',
  };

  // Admin routes
  /**
   * @swagger
   * tags:
   *   name: Admin Orders
   *   description: Order management endpoints for admin users
   */

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     tags: [Admin Orders]
   *     summary: Create a new order
   *     security:
   *       - clientType: [admin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PostOrder'
   *     responses:
   *       201:
   *         description: Order created successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized - Admin access required
   */
  router.post('/orders', isAdminClient, orderController.createOrder);

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     tags: [Admin Orders]
   *     summary: Get all orders with optional status filter
   *     security:
   *       - clientType: [admin]
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED]
   *         description: Filter orders by status
   *     responses:
   *       200:
   *         description: List of orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       401:
   *         description: Unauthorized - Admin access required
   */
  router.get('/orders', isAdminClient, orderController.getAllOrders);

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     tags: [Admin Orders]
   *     summary: Get order by ID
   *     security:
   *       - clientType: [admin]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *       401:
   *         description: Unauthorized - Admin access required
   */
  router.get('/orders/:id', isAdminClient, orderController.getOrderById);

  /**
   * @swagger
   * /api/orders/{id}:
   *   patch:
   *     tags: [Admin Orders]
   *     summary: Update order status (Admin only)
   *     description: |
   *       Admins can update the status of an order. Allowed transitions:
   *         - PENDING → CONFIRMED
   *         - CONFIRMED → PREPARING
   *         - PREPARING → READY
   *         - READY → DELIVERED
   *         - Any status → CANCELLED
   *     security:
   *       - clientType: [admin]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PatchAdminOrder'
   *     responses:
   *       200:
   *         description: Order updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OrderResponse'
   *       400:
   *         description: Invalid input data or status transition
   *       404:
   *         description: Order not found
   *       401:
   *         description: Unauthorized - Admin access required
   */
  router.patch('/orders/:id', isAdminClient, orderController.updateOrder);

  /**
   * @swagger
   * /api/orders/{id}:
   *   delete:
   *     tags: [Admin Orders]
   *     summary: Soft delete order
   *     description: |
   *       Only cancelled orders can be deleted by default. Admins can force delete any order by setting the ignoreState query parameter to true.
   *     security:
   *       - clientType: [admin]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *       - in: query
   *         name: ignoreState
   *         required: false
   *         schema:
   *           type: string
   *           enum: ["true", "false"]
   *         description: Set to true to force delete regardless of order status (admin only)
   *     responses:
   *       200:
   *         description: Order deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Order deleted successfully
   *       400:
   *         description: Only cancelled orders can be deleted unless ignoreState is true
   *       404:
   *         description: Order not found
   *       401:
   *         description: Unauthorized - Admin access required
   */
  router.delete('/orders/:id', isAdminClient, orderController.softDeleteOrder);

  // iOS routes
  /**
   * @swagger
   * tags:
   *   name: iOS Orders
   *   description: Order management endpoints for iOS app users
   */

  /**
   * @swagger
   * /api/my-orders:
   *   post:
   *     tags: [iOS Orders]
   *     summary: Create a new order
   *     security:
   *       - clientType: [ios]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PostOrder'
   *     responses:
   *       201:
   *         description: Order created successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized - iOS access required
   */
  router.post('/my-orders', isIOSClient, orderController.createOrder);

  /**
   * @swagger
   * /api/my-orders:
   *   get:
   *     tags: [iOS Orders]
   *     summary: Get all orders for the current user
   *     security:
   *       - clientType: [ios]
   *     responses:
   *       200:
   *         description: List of orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       401:
   *         description: Unauthorized - iOS access required
   */
  router.get('/my-orders', isIOSClient, orderController.getAllOrders);

  /**
   * @swagger
   * /api/my-orders/{id}:
   *   get:
   *     tags: [iOS Orders]
   *     summary: Get order by ID
   *     security:
   *       - clientType: [ios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *       401:
   *         description: Unauthorized - iOS access required
   */
  router.get('/my-orders/:id', isIOSClient, orderController.getOrderById);

  /**
   * @swagger
   * /api/my-orders/{id}:
   *   patch:
   *     tags: [iOS Orders]
   *     summary: Update or cancel order (iOS only)
   *     description: |
   *       iOS users can update customerName, deliveryAddress, and orderItems if the order is still PENDING.
   *       They can also cancel a PENDING order by setting status to 'cancelled'.
   *       No updates are allowed if the order is not PENDING.
   *     security:
   *       - clientType: [ios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PatchIOSOrder'
   *     responses:
   *       200:
   *         description: Order updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OrderResponse'
   *       400:
   *         description: Invalid input data or status transition
   *       404:
   *         description: Order not found
   *       401:
   *         description: Unauthorized - iOS access required
   */
  router.patch('/my-orders/:id', isIOSClient, orderController.updateOrder);

  return router;
}
