-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 09/09/2026 às 21:00
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `coffee_shop`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard` ()   BEGIN
    SELECT
        (SELECT COUNT(*) FROM sale) AS total_sales,
        (SELECT COUNT(*) FROM client) AS total_clients,
        (SELECT ROUND(SUM(total),2) FROM sale) AS total_revenue,
        (SELECT ROUND(AVG(total),2) FROM sale) AS average_ticket;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_metrics` (IN `p_limit` INT, IN `p_category` VARCHAR(50), IN `p_start_date` DATE, IN `p_end_date` DATE)   BEGIN
    IF p_limit IS NULL THEN
        SET p_limit = 100;
    END IF;

    SELECT
        s.id_sale,
        s.sale_date,
        cl.name AS client,
        d.name AS drink,
        cat.name AS category,
        si.quantity,
        si.unit_price,
        si.subtotal
    FROM sale s
    JOIN client cl ON cl.id_client = s.id_client
    JOIN sale_item si ON si.id_sale = s.id_sale
    JOIN drink d ON d.id_drink = si.id_drink
    JOIN category cat ON cat.id_category = d.id_category
    WHERE (p_category IS NULL OR p_category = '' OR cat.name = p_category)
      AND (p_start_date IS NULL OR DATE(s.sale_date) >= p_start_date)
      AND (p_end_date IS NULL OR DATE(s.sale_date) <= p_end_date)
    ORDER BY s.sale_date DESC
    LIMIT p_limit;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_search_drinks` (IN `search_name` VARCHAR(100))   BEGIN
    SELECT
        d.id_drink,
        d.name,
        d.price,
        d.stock,
        c.name AS category
    FROM drink d
    JOIN category c
        ON d.id_category = c.id_category
    WHERE d.name LIKE CONCAT('%', search_name, '%')
    ORDER BY d.name;
END$$

--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calculate_subtotal` (`qty` INT, `unit_value` DECIMAL(10,2)) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
    RETURN qty * unit_value;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `category`
--

CREATE TABLE `category` (
  `id_category` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `category`
--

INSERT INTO `category` (`id_category`, `name`) VALUES
(3, 'Chocolate'),
(1, 'Coffee'),
(10, 'Creamy Drink'),
(6, 'Frappé'),
(4, 'Iced Coffee'),
(8, 'Italian Soda'),
(7, 'Matcha'),
(9, 'Seasonal Drink'),
(5, 'Special Coffee'),
(2, 'Tea');

-- --------------------------------------------------------

--
-- Estrutura para tabela `client`
--

CREATE TABLE `client` (
  `id_client` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `client`
--

INSERT INTO `client` (`id_client`, `name`, `phone`, `email`) VALUES
(1, 'Ana Silva', '44999110001', 'ana@email.com'),
(2, 'Bruno Costa', '44999110002', 'bruno@email.com'),
(3, 'Carla Souza', '44999110003', 'carla@email.com'),
(4, 'Diego Lima', '44999110004', 'diego@email.com'),
(5, 'Eduarda Rocha', '44999110005', 'eduarda@email.com'),
(6, 'Felipe Martins', '44999110006', 'felipe@email.com'),
(7, 'Gabriela Alves', '44999110007', 'gabriela@email.com'),
(8, 'Henrique Dias', '44999110008', 'henrique@email.com'),
(9, 'Isabela Gomes', '44999110009', 'isabela@email.com'),
(10, 'João Pedro', '44999110010', 'joao@email.com'),
(11, 'Karen Mendes', '44999110011', 'karen@email.com'),
(12, 'Lucas Oliveira', '44999110012', 'lucas@email.com'),
(13, 'Mariana Pinto', '44999110013', 'mariana@email.com'),
(14, 'Natália Castro', '44999110014', 'natalia@email.com'),
(15, 'Otávio Ribeiro', '44999110015', 'otavio@email.com'),
(16, 'Paula Freitas', '44999110016', 'paula@email.com'),
(17, 'Rafael Moreira', '44999110017', 'rafael@email.com'),
(18, 'Sofia Nunes', '44999110018', 'sofia@email.com'),
(19, 'Thiago Lopes', '44999110019', 'thiago@email.com'),
(20, 'Vitória Campos', '44999110020', 'vitoria@email.com'),
(21, 'Amanda Pereira', '44999110021', 'amanda@email.com'),
(22, 'André Santos', '44999110022', 'andre@email.com'),
(23, 'Beatriz Carvalho', '44999110023', 'beatriz@email.com'),
(24, 'Caio Fernandes', '44999110024', 'caio@email.com'),
(25, 'Camila Barbosa', '44999110025', 'camila@email.com'),
(26, 'Daniel Vieira', '44999110026', 'daniel@email.com'),
(27, 'Elisa Moura', '44999110027', 'elisa@email.com'),
(28, 'Fernando Reis', '44999110028', 'fernando@email.com'),
(29, 'Giovana Teixeira', '44999110029', 'giovana@email.com'),
(30, 'Gustavo Prado', '44999110030', 'gustavo@email.com'),
(31, 'Helena Ramos', '44999110031', 'helena@email.com'),
(32, 'Igor Batista', '44999110032', 'igor@email.com'),
(33, 'Juliana Moraes', '44999110033', 'juliana@email.com'),
(34, 'Leonardo Cunha', '44999110034', 'leo@email.com'),
(35, 'Larissa Duarte', '44999110035', 'larissa@email.com'),
(36, 'Marcelo Andrade', '44999110036', 'marcelo@email.com'),
(37, 'Nicole Fernandes', '44999110037', 'nicole@email.com'),
(38, 'Pedro Henrique', '44999110038', 'pedro@email.com'),
(39, 'Renata Farias', '44999110039', 'renata@email.com'),
(40, 'Yasmin Oliveira', '44999110040', 'yasmin@email.com');

-- --------------------------------------------------------

--
-- Estrutura para tabela `drink`
--

CREATE TABLE `drink` (
  `id_drink` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `id_category` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `drink`
--

INSERT INTO `drink` (`id_drink`, `name`, `price`, `stock`, `id_category`) VALUES
(1, 'Espresso', 6.00, 120, 1),
(2, 'Drip Coffee', 5.00, 150, 1),
(3, 'Cappuccino', 10.00, 80, 1),
(4, 'Latte', 11.00, 70, 1),
(5, 'Mocha', 12.00, 60, 1),
(6, 'Hot Chocolate', 11.00, 50, 3),
(7, 'Green Tea', 8.00, 90, 2),
(8, 'Chamomile Tea', 7.00, 100, 2),
(9, 'Cold Brew', 13.00, 40, 4),
(10, 'Frappuccino', 15.00, 35, 4),
(11, 'Macchiato', 9.50, 60, 5),
(12, 'Affogato', 14.00, 25, 5),
(13, 'Coffee Frappé', 16.00, 40, 6),
(14, 'Chocolate Frappé', 17.00, 35, 6),
(15, 'Caramel Frappé', 18.00, 30, 6),
(16, 'Vanilla Frappé', 17.50, 30, 6),
(17, 'Matcha Latte', 15.00, 45, 7),
(18, 'Iced Matcha', 16.00, 35, 7),
(19, 'Vanilla Matcha', 17.00, 25, 7),
(20, 'Strawberry Italian Soda', 14.00, 40, 8),
(21, 'Sicilian Lemon Italian Soda', 14.00, 35, 8),
(22, 'Mixed Berry Italian Soda', 15.00, 30, 8),
(23, 'Green Apple Italian Soda', 15.00, 30, 8),
(24, 'Pumpkin Spice Latte', 19.00, 25, 9),
(25, 'Gingerbread Latte', 18.00, 20, 9),
(26, 'Hot White Chocolate', 15.00, 30, 9),
(27, 'Cinnamon Latte', 14.50, 35, 9),
(28, 'White Mocha', 15.00, 30, 10),
(29, 'Caramel Latte', 14.00, 40, 10),
(30, 'Hazelnut Cappuccino', 15.50, 30, 10);

--
-- Acionadores `drink`
--
DELIMITER $$
CREATE TRIGGER `trg_drink_before_update` BEFORE UPDATE ON `drink` FOR EACH ROW BEGIN
    IF NEW.price < 0 THEN
        SET NEW.price = ABS(NEW.price);
    END IF;

    IF NEW.stock < 0 THEN
        SET NEW.stock = ABS(NEW.stock);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sale`
--

CREATE TABLE `sale` (
  `id_sale` int(11) NOT NULL,
  `sale_date` datetime DEFAULT current_timestamp(),
  `id_client` int(11) NOT NULL,
  `total` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `sale`
--

INSERT INTO `sale` (`id_sale`, `sale_date`, `id_client`, `total`) VALUES
(1, '2026-07-01 08:20:00', 1, 22.00),
(2, '2026-07-01 09:10:00', 2, 21.00),
(3, '2026-07-01 14:30:00', 3, 28.00),
(4, '2026-07-02 10:00:00', 4, 17.00),
(5, '2026-07-02 15:45:00', 5, 28.00),
(6, '2026-07-03 08:15:00', 6, 25.00),
(7, '2026-07-03 11:40:00', 7, 29.00),
(8, '2026-07-04 09:25:00', 8, 24.00),
(9, '2026-07-04 16:20:00', 9, 30.00),
(10, '2026-07-05 13:10:00', 10, 36.00),
(11, '2026-07-06 08:00:00', 11, 29.50),
(12, '2026-07-06 09:35:00', 12, 26.00),
(13, '2026-07-07 11:50:00', 13, 27.00),
(14, '2026-07-07 14:05:00', 14, 25.00),
(15, '2026-07-08 10:45:00', 15, 30.00),
(16, '2026-07-08 15:00:00', 16, 28.00),
(17, '2026-07-09 08:55:00', 17, 33.50),
(18, '2026-07-09 12:20:00', 18, 20.00),
(19, '2026-07-10 09:15:00', 19, 32.00),
(20, '2026-07-10 16:40:00', 20, 27.00),
(21, '2026-07-11 08:30:00', 1, 30.00),
(22, '2026-07-11 17:10:00', 5, 31.00),
(23, '2026-07-12 09:05:00', 8, 38.00),
(24, '2026-07-12 13:50:00', 10, 27.00),
(25, '2026-07-13 08:10:00', 12, 26.00),
(26, '2026-07-13 15:30:00', 15, 26.00),
(27, '2026-07-14 11:15:00', 18, 26.00),
(28, '2026-07-14 17:20:00', 20, 24.50),
(29, '2026-07-15 10:00:00', 7, 25.00),
(30, '2026-07-15 18:00:00', 3, 29.00),
(31, '2026-07-16 07:45:00', 21, 17.00),
(32, '2026-07-16 08:20:00', 22, 29.50),
(33, '2026-07-16 09:15:00', 23, 23.00),
(34, '2026-07-16 15:30:00', 24, 34.00),
(35, '2026-07-17 08:10:00', 25, 28.00),
(36, '2026-07-17 10:45:00', 26, 37.00),
(37, '2026-07-17 16:00:00', 27, 48.00),
(38, '2026-07-18 09:30:00', 28, 31.00),
(39, '2026-07-18 14:20:00', 29, 22.00),
(40, '2026-07-18 17:10:00', 30, 31.50),
(41, '2026-07-19 07:55:00', 31, 34.00),
(42, '2026-07-19 11:15:00', 32, 39.50),
(43, '2026-07-20 13:40:00', 33, 30.00),
(44, '2026-07-20 15:50:00', 34, 33.00),
(45, '2026-07-21 08:05:00', 35, 24.00),
(46, '2026-07-21 09:50:00', 36, 25.00),
(47, '2026-07-22 14:10:00', 37, 50.00),
(48, '2026-07-22 16:40:00', 38, 29.00),
(49, '2026-07-23 08:30:00', 39, 28.00),
(50, '2026-07-23 17:20:00', 40, 33.00),
(51, '2026-07-24 09:00:00', 5, 19.50),
(52, '2026-07-24 15:10:00', 8, 31.00),
(53, '2026-07-25 08:25:00', 12, 35.00),
(54, '2026-07-25 14:45:00', 18, 29.00),
(55, '2026-07-26 09:40:00', 22, 32.00),
(56, '2026-07-26 16:30:00', 27, 31.50),
(57, '2026-07-27 08:15:00', 35, 34.00),
(58, '2026-07-27 17:40:00', 40, 37.00),
(59, '2026-07-28 10:20:00', 15, 32.50),
(60, '2026-07-28 15:55:00', 30, 46.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `sale_item`
--

CREATE TABLE `sale_item` (
  `id_item` int(11) NOT NULL,
  `id_sale` int(11) NOT NULL,
  `id_drink` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `sale_item`
--

INSERT INTO `sale_item` (`id_item`, `id_sale`, `id_drink`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, 1, 2, 6.00, 12.00),
(2, 1, 3, 1, 10.00, 10.00),
(3, 2, 2, 2, 5.00, 10.00),
(4, 2, 6, 1, 11.00, 11.00),
(5, 3, 5, 1, 12.00, 12.00),
(6, 3, 7, 2, 8.00, 16.00),
(7, 4, 4, 1, 11.00, 11.00),
(8, 4, 1, 1, 6.00, 6.00),
(9, 5, 9, 1, 13.00, 13.00),
(10, 5, 10, 1, 15.00, 15.00),
(11, 6, 1, 3, 6.00, 18.00),
(12, 6, 8, 1, 7.00, 7.00),
(13, 7, 11, 2, 9.50, 19.00),
(14, 7, 3, 1, 10.00, 10.00),
(15, 8, 2, 2, 5.00, 10.00),
(16, 8, 12, 1, 14.00, 14.00),
(17, 9, 6, 2, 11.00, 22.00),
(18, 9, 7, 1, 8.00, 8.00),
(19, 10, 10, 2, 15.00, 30.00),
(20, 10, 1, 1, 6.00, 6.00),
(21, 11, 3, 2, 10.00, 20.00),
(22, 11, 11, 1, 9.50, 9.50),
(23, 12, 5, 1, 12.00, 12.00),
(24, 12, 8, 2, 7.00, 14.00),
(25, 13, 4, 2, 11.00, 22.00),
(26, 13, 2, 1, 5.00, 5.00),
(27, 14, 12, 1, 14.00, 14.00),
(28, 14, 6, 1, 11.00, 11.00),
(29, 15, 7, 3, 8.00, 24.00),
(30, 15, 1, 1, 6.00, 6.00),
(31, 16, 10, 1, 15.00, 15.00),
(32, 16, 9, 1, 13.00, 13.00),
(33, 17, 11, 1, 9.50, 9.50),
(34, 17, 5, 2, 12.00, 24.00),
(35, 18, 3, 1, 10.00, 10.00),
(36, 18, 2, 2, 5.00, 10.00),
(37, 19, 8, 3, 7.00, 21.00),
(38, 19, 4, 1, 11.00, 11.00),
(39, 20, 1, 2, 6.00, 12.00),
(40, 20, 10, 1, 15.00, 15.00),
(41, 21, 6, 1, 11.00, 11.00),
(42, 21, 11, 2, 9.50, 19.00),
(43, 22, 9, 2, 13.00, 26.00),
(44, 22, 2, 1, 5.00, 5.00),
(45, 23, 5, 2, 12.00, 24.00),
(46, 23, 12, 1, 14.00, 14.00),
(47, 24, 4, 1, 11.00, 11.00),
(48, 24, 7, 2, 8.00, 16.00),
(49, 25, 1, 1, 6.00, 6.00),
(50, 25, 3, 2, 10.00, 20.00),
(51, 26, 10, 1, 15.00, 15.00),
(52, 26, 6, 1, 11.00, 11.00),
(53, 27, 8, 2, 7.00, 14.00),
(54, 27, 5, 1, 12.00, 12.00),
(55, 28, 2, 3, 5.00, 15.00),
(56, 28, 11, 1, 9.50, 9.50),
(57, 29, 9, 1, 13.00, 13.00),
(58, 29, 1, 2, 6.00, 12.00),
(59, 30, 12, 1, 14.00, 14.00),
(60, 30, 10, 1, 15.00, 15.00),
(61, 31, 1, 2, 6.00, 12.00),
(62, 31, 2, 1, 5.00, 5.00),
(63, 32, 3, 2, 10.00, 20.00),
(64, 32, 11, 1, 9.50, 9.50),
(65, 33, 4, 1, 11.00, 11.00),
(66, 33, 5, 1, 12.00, 12.00),
(67, 34, 13, 1, 16.00, 16.00),
(68, 34, 15, 1, 18.00, 18.00),
(69, 35, 1, 3, 6.00, 18.00),
(70, 35, 3, 1, 10.00, 10.00),
(71, 36, 4, 2, 11.00, 22.00),
(72, 36, 17, 1, 15.00, 15.00),
(73, 37, 14, 2, 17.00, 34.00),
(74, 37, 20, 1, 14.00, 14.00),
(75, 38, 18, 1, 16.00, 16.00),
(76, 38, 22, 1, 15.00, 15.00),
(77, 39, 1, 2, 6.00, 12.00),
(78, 39, 2, 2, 5.00, 10.00),
(79, 40, 16, 1, 17.50, 17.50),
(80, 40, 21, 1, 14.00, 14.00),
(81, 41, 3, 2, 10.00, 20.00),
(82, 41, 29, 1, 14.00, 14.00),
(83, 42, 5, 2, 12.00, 24.00),
(84, 42, 30, 1, 15.50, 15.50),
(85, 43, 11, 2, 9.50, 19.00),
(86, 43, 4, 1, 11.00, 11.00),
(87, 44, 13, 1, 16.00, 16.00),
(88, 44, 19, 1, 17.00, 17.00),
(89, 45, 1, 2, 6.00, 12.00),
(90, 45, 5, 1, 12.00, 12.00),
(91, 46, 3, 1, 10.00, 10.00),
(92, 46, 17, 1, 15.00, 15.00),
(93, 47, 15, 2, 18.00, 36.00),
(94, 47, 21, 1, 14.00, 14.00),
(95, 48, 20, 1, 14.00, 14.00),
(96, 48, 10, 1, 15.00, 15.00),
(97, 49, 1, 3, 6.00, 18.00),
(98, 49, 3, 1, 10.00, 10.00),
(99, 50, 14, 1, 17.00, 17.00),
(100, 50, 18, 1, 16.00, 16.00),
(101, 51, 2, 2, 5.00, 10.00),
(102, 51, 11, 1, 9.50, 9.50),
(103, 52, 13, 1, 16.00, 16.00),
(104, 52, 22, 1, 15.00, 15.00),
(105, 53, 5, 2, 12.00, 24.00),
(106, 53, 4, 1, 11.00, 11.00),
(107, 54, 17, 1, 15.00, 15.00),
(108, 54, 29, 1, 14.00, 14.00),
(109, 55, 1, 2, 6.00, 12.00),
(110, 55, 3, 2, 10.00, 20.00),
(111, 56, 16, 1, 17.50, 17.50),
(112, 56, 20, 1, 14.00, 14.00),
(113, 57, 15, 1, 18.00, 18.00),
(114, 57, 18, 1, 16.00, 16.00),
(115, 58, 24, 1, 19.00, 19.00),
(116, 58, 25, 1, 18.00, 18.00),
(117, 59, 26, 1, 18.00, 18.00),
(118, 59, 27, 1, 14.50, 14.50),
(119, 60, 28, 1, 15.00, 15.00),
(120, 60, 30, 2, 15.50, 31.00);

--
-- Acionadores `sale_item`
--
DELIMITER $$
CREATE TRIGGER `trg_sale_item_before_insert` BEFORE INSERT ON `sale_item` FOR EACH ROW BEGIN
    IF NEW.quantity < 0 THEN
        SET NEW.quantity = ABS(NEW.quantity);
    END IF;

    IF NEW.unit_price < 0 THEN
        SET NEW.unit_price = ABS(NEW.unit_price);
    END IF;

    IF NEW.subtotal < 0 THEN
        SET NEW.subtotal = ABS(NEW.subtotal);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_sale_item_before_update` BEFORE UPDATE ON `sale_item` FOR EACH ROW BEGIN
    IF NEW.quantity < 0 THEN
        SET NEW.quantity = ABS(NEW.quantity);
    END IF;

    IF NEW.unit_price < 0 THEN
        SET NEW.unit_price = ABS(NEW.unit_price);
    END IF;

    IF NEW.subtotal < 0 THEN
        SET NEW.subtotal = ABS(NEW.subtotal);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_low_stock`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_low_stock` (
`name` varchar(100)
,`stock` int(11)
,`price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_sales_analytics`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_sales_analytics` (
`id_sale` int(11)
,`sale_date` datetime
,`client` varchar(100)
,`drink` varchar(100)
,`category` varchar(50)
,`quantity` int(11)
,`unit_price` decimal(10,2)
,`subtotal` decimal(10,2)
,`sale_day` date
,`sale_month` int(2)
,`sale_year` int(4)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_sales_complete`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_sales_complete` (
`id_sale` int(11)
,`sale_date` datetime
,`client` varchar(100)
,`drink` varchar(100)
,`category` varchar(50)
,`quantity` int(11)
,`unit_price` decimal(10,2)
,`subtotal` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_low_stock`
--
DROP TABLE IF EXISTS `vw_low_stock`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_low_stock`  AS SELECT `drink`.`name` AS `name`, `drink`.`stock` AS `stock`, `drink`.`price` AS `price` FROM `drink` WHERE `drink`.`stock` < 50 ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_sales_analytics`
--
DROP TABLE IF EXISTS `vw_sales_analytics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_sales_analytics`  AS SELECT `s`.`id_sale` AS `id_sale`, `s`.`sale_date` AS `sale_date`, `cl`.`name` AS `client`, `d`.`name` AS `drink`, `cat`.`name` AS `category`, `si`.`quantity` AS `quantity`, `si`.`unit_price` AS `unit_price`, `si`.`subtotal` AS `subtotal`, cast(`s`.`sale_date` as date) AS `sale_day`, month(`s`.`sale_date`) AS `sale_month`, year(`s`.`sale_date`) AS `sale_year` FROM ((((`sale` `s` join `client` `cl` on(`cl`.`id_client` = `s`.`id_client`)) join `sale_item` `si` on(`si`.`id_sale` = `s`.`id_sale`)) join `drink` `d` on(`d`.`id_drink` = `si`.`id_drink`)) join `category` `cat` on(`cat`.`id_category` = `d`.`id_category`)) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_sales_complete`
--
DROP TABLE IF EXISTS `vw_sales_complete`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_sales_complete`  AS SELECT `s`.`id_sale` AS `id_sale`, `s`.`sale_date` AS `sale_date`, `cl`.`name` AS `client`, `d`.`name` AS `drink`, `c`.`name` AS `category`, `si`.`quantity` AS `quantity`, `si`.`unit_price` AS `unit_price`, `si`.`subtotal` AS `subtotal` FROM ((((`sale` `s` join `client` `cl` on(`s`.`id_client` = `cl`.`id_client`)) join `sale_item` `si` on(`s`.`id_sale` = `si`.`id_sale`)) join `drink` `d` on(`si`.`id_drink` = `d`.`id_drink`)) join `category` `c` on(`d`.`id_category` = `c`.`id_category`)) ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id_category`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices de tabela `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id_client`);

--
-- Índices de tabela `drink`
--
ALTER TABLE `drink`
  ADD PRIMARY KEY (`id_drink`),
  ADD KEY `id_category` (`id_category`);

--
-- Índices de tabela `sale`
--
ALTER TABLE `sale`
  ADD PRIMARY KEY (`id_sale`),
  ADD KEY `id_client` (`id_client`);

--
-- Índices de tabela `sale_item`
--
ALTER TABLE `sale_item`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `id_sale` (`id_sale`),
  ADD KEY `id_drink` (`id_drink`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `category`
--
ALTER TABLE `category`
  MODIFY `id_category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `client`
--
ALTER TABLE `client`
  MODIFY `id_client` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de tabela `drink`
--
ALTER TABLE `drink`
  MODIFY `id_drink` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `sale`
--
ALTER TABLE `sale`
  MODIFY `id_sale` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de tabela `sale_item`
--
ALTER TABLE `sale_item`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `drink`
--
ALTER TABLE `drink`
  ADD CONSTRAINT `drink_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `category` (`id_category`);

--
-- Restrições para tabelas `sale`
--
ALTER TABLE `sale`
  ADD CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`);

--
-- Restrições para tabelas `sale_item`
--
ALTER TABLE `sale_item`
  ADD CONSTRAINT `sale_item_ibfk_1` FOREIGN KEY (`id_sale`) REFERENCES `sale` (`id_sale`),
  ADD CONSTRAINT `sale_item_ibfk_2` FOREIGN KEY (`id_drink`) REFERENCES `drink` (`id_drink`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
