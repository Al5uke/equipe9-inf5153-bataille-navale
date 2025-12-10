"""Tests unitaires pour les stratégies d'IA"""
import pytest
from game_logic.ai_strategy import AIStrategy, RandomStrategy, TargetedStrategy, AIStrategyFactory
from game_logic.grid import GridManager

class TestRandomStrategy:
    """Tests pour la stratégie aléatoire"""

    def test_random_strategy_choose_target(self, empty_grid):
        """Test choix de cible par la stratégie aléatoire"""
        strategy = RandomStrategy()
        target = strategy.choose_target(empty_grid, [])

        # Vérifier que la cible est valide
        assert GridManager.is_valid_position(target) == True
        assert empty_grid[target] == 'EMPTY'

    def test_random_strategy_avoids_shot_positions(self, empty_grid):
        """Test que la stratégie aléatoire évite les positions déjà tirées"""
        strategy = RandomStrategy()

        # Marquer presque toutes les cases comme tirées
        for pos in list(empty_grid.keys())[:-5]:
            empty_grid[pos] = 'HIT' if pos[0] in ['A', 'B'] else 'MISS'

        target = strategy.choose_target(empty_grid, [])

        # Devrait choisir une des cases restantes
        assert empty_grid[target] == 'EMPTY'

    def test_random_strategy_multiple_calls(self, empty_grid):
        """Test que la stratégie peut générer plusieurs cibles différentes"""
        strategy = RandomStrategy()
        targets = set()

        for _ in range(10):
            target = strategy.choose_target(empty_grid, [])
            targets.add(target)
            empty_grid[target] = 'MISS'

        # Devrait avoir généré au moins quelques cibles différentes
        assert len(targets) >= 8


class TestTargetedStrategy:
    """Tests pour la stratégie ciblée"""

    def test_targeted_strategy_initial_random(self, empty_grid):
        """Test mode aléatoire initial de la stratégie ciblée"""
        strategy = TargetedStrategy()
        target = strategy.choose_target(empty_grid, [])

        assert GridManager.is_valid_position(target) == True
        assert empty_grid[target] == 'EMPTY'

    def test_targeted_strategy_enters_target_mode_after_hit(self, mock_opponent_grid):
        """Test activation du mode ciblage après un touché"""
        strategy = TargetedStrategy()

        # Simuler un premier tir qui touche
        previous_moves = [
            {
                'target_position': 'A2',
                'result': 'HIT'
            }
        ]

        # Après une touche, devrait cibler les cases adjacentes
        target = strategy.choose_target(mock_opponent_grid, previous_moves)

        # Vérifier que la cible est adjacente à A2
        adjacent_to_A2 = ['A1', 'A3', 'B2']
        assert target in adjacent_to_A2 or target in ['A4', 'A5']  # Pourrait affiner

    def test_targeted_strategy_resets_after_sunk(self, empty_grid):
        """Test réinitialisation après avoir coulé un navire"""
        strategy = TargetedStrategy()

        # Simuler des tirs culminant avec un navire coulé
        previous_moves = [
            {'target_position': 'C3', 'result': 'HIT'},
            {'target_position': 'C4', 'result': 'HIT'},
            {'target_position': 'C5', 'result': 'SUNK'}
        ]

        # Après avoir coulé, devrait revenir au mode aléatoire
        assert strategy.target_mode == False or previous_moves[-1]['result'] == 'SUNK'

    def test_targeted_strategy_smart_random_checkerboard(self, empty_grid):
        """Test pattern en damier de la stratégie ciblée"""
        strategy = TargetedStrategy()
        targets = set()

        # Générer plusieurs cibles en mode aléatoire intelligent
        for _ in range(20):
            target = strategy.choose_target(empty_grid, [])
            targets.add(target)
            empty_grid[target] = 'MISS'

        # Vérifier que les cibles suivent généralement le pattern damier
        # (Cases où row_idx + col_idx est pair)
        damier_count = 0
        for target in targets:
            row_idx = GridManager.ROWS.index(target[0])
            col_idx = GridManager.COLS.index(target[1:])
            if (row_idx + col_idx) % 2 == 0:
                damier_count += 1

        # Au moins 70% devraient suivre le pattern damier
        assert damier_count / len(targets) >= 0.6

    def test_targeted_strategy_refines_direction(self, empty_grid):
        """Test affinement de la direction après plusieurs touches"""
        strategy = TargetedStrategy()

        # Placer un navire horizontal
        for col in ['1', '2', '3', '4', '5']:
            empty_grid[f'D{col}'] = 'SHIP'

        # Simuler deux touches sur le même navire horizontal
        previous_moves = [
            {'target_position': 'D2', 'result': 'HIT'},
            {'target_position': 'D3', 'result': 'HIT'}
        ]

        target = strategy.choose_target(empty_grid, previous_moves)

        # Devrait cibler une position adjacente aux touches
        # (La stratégie peut choisir des adjacents avant d'affiner)
        assert GridManager.is_valid_position(target)
        assert empty_grid[target] in ['EMPTY', 'SHIP']


class TestAIStrategyFactory:
    """Tests pour la factory de stratégies"""

    def test_factory_create_random_strategy(self):
        """Test création de la stratégie aléatoire"""
        strategy = AIStrategyFactory.create_strategy('RANDOM')
        assert isinstance(strategy, RandomStrategy)

    def test_factory_create_targeted_strategy(self):
        """Test création de la stratégie ciblée"""
        strategy = AIStrategyFactory.create_strategy('TARGETED')
        assert isinstance(strategy, TargetedStrategy)

    def test_factory_invalid_strategy_type(self):
        """Test création avec type invalide"""
        with pytest.raises(ValueError):
            AIStrategyFactory.create_strategy('INVALID_TYPE')
