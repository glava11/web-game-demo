import {describe, it, expect, beforeEach} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import SliderGame from './SliderGame.vue';

describe('SliderGame Component', () => {
	beforeEach(() => {
		// Create a fresh Pinia instance for each test
		setActivePinia(createPinia());
	});

	it('renders the game title', () => {
		const wrapper = mount(SliderGame);
		expect(wrapper.text()).toContain('Quicky Finger');
	});

	it('shows start button initially', () => {
		const wrapper = mount(SliderGame);
		const startButton = wrapper.find('button');
		expect(startButton.text()).toContain('Start Game');
	});

	it('shows stop button when game is playing', async () => {
		const wrapper = mount(SliderGame);

		// Click start button
		await wrapper.find('button').trigger('click');

		// Should now show stop button
		const stopButton = wrapper.find('button');
		expect(stopButton.text()).toContain('STOP');
	});

	it('displays slider track when playing', async () => {
		const wrapper = mount(SliderGame);

		// Initially no slider visible
		expect(wrapper.find('.bg-gray-700').exists()).toBe(false);

		// Start game
		await wrapper.find('button').trigger('click');

		// Slider should be visible
		expect(wrapper.find('.bg-gray-700').exists()).toBe(true);
	});

	it('displays score after stopping', async () => {
		const wrapper = mount(SliderGame);

		// Start game
		await wrapper.find('button').trigger('click');

		// Stop game
		await wrapper.find('button').trigger('click');

		// Should show score (any number 0-1000)
		const scoreText = wrapper.text();
		expect(scoreText).toMatch(/\d+/); // Contains numbers
		expect(scoreText).toContain('Final Position');
	});

	it('shows play again button after game ends', async () => {
		const wrapper = mount(SliderGame);

		// Start and stop game
		await wrapper.find('button').trigger('click');
		await wrapper.find('button').trigger('click');

		// Should have play again button
		const playAgainButton = wrapper.find('button');
		expect(playAgainButton.text()).toContain('Play Again');
	});

	it('resets game when play again is clicked', async () => {
		const wrapper = mount(SliderGame);

		// Complete one game
		await wrapper.find('button').trigger('click'); // Start
		await wrapper.find('button').trigger('click'); // Stop

		// Click play again
		const playAgainButton = wrapper.find('button');
		await playAgainButton.trigger('click');

		// Should be playing again
		const stopButton = wrapper.find('button');
		expect(stopButton.text()).toContain('STOP');
	});

	it('displays instructions', () => {
		const wrapper = mount(SliderGame);
		const text = wrapper.text();

		expect(text).toContain('Perfect center');
		expect(text).toContain('1000 points');
	});

	it('shows best score after first game', async () => {
		const wrapper = mount(SliderGame);

		// Initially no best score shown
		expect(wrapper.text()).not.toContain('Best Score');

		// Complete one game
		await wrapper.find('button').trigger('click'); // Start
		await wrapper.find('button').trigger('click'); // Stop

		// Play again
		await wrapper.find('button').trigger('click');

		// Now should show best score
		expect(wrapper.text()).toContain('Best Score');
	});
});
