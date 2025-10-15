import {describe, it, expect, beforeEach} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import NicknameInput from './NicknameInput.vue';
import {useLeaderboardStore} from '../stores/leaderboardStore';

describe('NicknameInput', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('renders nickname input form', () => {
		const wrapper = mount(NicknameInput);
		expect(wrapper.find('input[type="text"]').exists()).toBe(true);
		expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
	});

	it('shows error for empty nickname', async () => {
		const wrapper = mount(NicknameInput);

		await wrapper.find('form').trigger('submit');

		expect(wrapper.text()).toContain('Please enter a nickname');
	});

	it('shows error for nickname too short', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');

		await input.setValue('a');
		await wrapper.find('form').trigger('submit');

		expect(wrapper.text()).toContain('at least 2 characters');
	});

	it('shows error for nickname too long', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');

		await input.setValue('a'.repeat(21));
		await wrapper.find('form').trigger('submit');

		expect(wrapper.text()).toContain('less than 20 characters');
	});

	it('accepts valid nickname and emits ready event', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');

		await input.setValue('Player123');
		await wrapper.find('form').trigger('submit');

		expect(wrapper.emitted('ready')).toBeTruthy();
	});

	it('trims whitespace from nickname', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');
		const store = useLeaderboardStore();

		await input.setValue('  Player  ');
		await wrapper.find('form').trigger('submit');

		expect(store.currentNickname).toBe('Player');
	});

	it('stores nickname in leaderboard store', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');
		const store = useLeaderboardStore();

		await input.setValue('TestPlayer');
		await wrapper.find('form').trigger('submit');

		expect(store.currentNickname).toBe('TestPlayer');
	});

	it('clears error on valid submission', async () => {
		const wrapper = mount(NicknameInput);
		const input = wrapper.find('input');

		// First trigger error
		await wrapper.find('form').trigger('submit');
		expect(wrapper.text()).toContain('Please enter');

		// Then submit valid nickname
		await input.setValue('ValidName');
		await wrapper.find('form').trigger('submit');

		expect(wrapper.text()).not.toContain('Please enter');
	});
});
