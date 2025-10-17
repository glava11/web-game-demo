import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import SliderGame from './SliderGame.vue';

describe('SliderGame Component', () => {
	let onScoreSubmit: ReturnType<typeof vi.fn>;
	let wrapper: ReturnType<typeof mount>;
	beforeEach(() => {
		vi.useFakeTimers();
		// Create a fresh Pinia instance for each test
		setActivePinia(createPinia());
		onScoreSubmit = vi.fn().mockResolvedValue(undefined);
		wrapper = mount(SliderGame, {
			props: {
				onScoreSubmit,
			},
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders the game title', () => {
		expect(wrapper.text()).toContain('Quicky Finger');
	});

	it('shows start button initially', async () => {
		const startButton = wrapper.find('button');

		expect(startButton.text()).toContain('Start Game');
	});

	it('shows stop button when game is playing', async () => {
		// Click start button
		await wrapper.find('button').trigger('click');

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		// Should now show stop button
		const stopButton = wrapper.find('button');
		expect(stopButton.text()).toContain('STOP');
	});

	it('displays slider track when playing', async () => {
		// Initially no slider visible
		expect(wrapper.find('.slider').exists()).toBe(false);

		// Start game
		await wrapper.find('button').trigger('click');

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		// Slider should be visible
		expect(wrapper.find('.slider').exists()).toBe(true);
	});

	it('displays score after stopping', async () => {
		// Start game
		await wrapper.find('button').trigger('click');

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		// Stop game
		await wrapper.find('button').trigger('click');

		// Should show score (any number 0-1000)
		const scoreText = wrapper.text();
		expect(scoreText).toMatch(/\d+/); // Contains numbers
		expect(scoreText).toContain('Final Position');
	});

	it('shows play again button after game ends', async () => {
		// Start and stop game
		await wrapper.find('button').trigger('click');

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		await wrapper.find('button').trigger('click');

		// Should have play again button
		const playAgainButton = wrapper.find('button');
		expect(playAgainButton.text()).toContain('Play Again');
	});

	it('resets game when play again is clicked', async () => {
		// Complete one game
		await wrapper.find('button').trigger('click'); // Start

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		await wrapper.find('button').trigger('click'); // Stop

		// Click play again
		const playAgainButton = wrapper.find('button');
		await playAgainButton.trigger('click');

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		// Should be playing again
		const stopButton = wrapper.find('button');
		expect(stopButton.text()).toContain('STOP');
	});

	it('displays instructions', () => {
		const text = wrapper.text();

		expect(text).toContain('Perfect center');
		expect(text).toContain('1000 points');
	});

	it('shows best score after first game', async () => {
		// Initially no best score shown
		expect(wrapper.text()).not.toContain('Best Score');

		// Complete one game
		await wrapper.find('button').trigger('click'); // Start

		// wait 3 seconds for button to show up
		vi.advanceTimersByTime(3000);
		await wrapper.vm.$nextTick();

		await wrapper.find('button').trigger('click'); // Stop

		// Play again
		await wrapper.find('button').trigger('click');

		// Now should show best score
		expect(wrapper.text()).toContain('Best Score');
	});
});
