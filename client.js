window.__ModuleLoader__.load({
	id: 'dsh-conversation-width',
	factory(require) {
		const React = require('react');
		const h = React.createElement;

		/** Bundle identity; also the marker of the injected <style> element. */
		const NAME = 'dsh-conversation-width';
		/** Client locale namespace this module registers. */
		const NS = 'conversation-width';
		/** localStorage key holding this plugin's own width preference. */
		const STORE_KEY = 'dsh.conversationWidth';

		const DICT = {
			zh: {
				title: '对话框宽度',
				description: '对话框宽度设置，「默认可调」时可手动拖动。',
				modeDefault: '默认可调',
				modePx: '固定像素',
				modePercent: '窗口比例',
				modeLabel: '对话框宽度模式',
				valueLabel: '对话框宽度数值',
				increase: '增大',
				decrease: '减小',
			},
			en: {
				title: 'Conversation width',
				description: 'Conversation width; “Default” stays draggable.',
				modeDefault: 'Default (draggable)',
				modePx: 'Fixed pixels',
				modePercent: 'Share of window',
				modeLabel: 'Conversation width mode',
				valueLabel: 'Conversation width value',
				increase: 'Increase',
				decrease: 'Decrease',
			},
		};

		/** @type {{mode: 'default' | 'px' | 'percent', px: number, percent: number}} */
		const DEFAULT_CONFIG = { mode: 'default', px: 820, percent: 72 };
		const LIMITS = { px: [420, 2400], percent: [40, 100] };
		/** One arrow press: ten pixels keeps a drag-free nudge useful, one point keeps ratios exact. */
		const STEPS = { px: 10, percent: 1 };
		const MODES = ['default', 'px', 'percent'];

		/** Round one numeric input into its allowed range, falling back when unparsable. */
		function clampInt(value, min, max, fallback) {
			const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
			if (!Number.isFinite(parsed)) return fallback;
			return Math.round(Math.min(max, Math.max(min, parsed)));
		}

		/** Coerce anything read from storage into a complete, in-range configuration. */
		function normalize(raw) {
			const source = raw !== null && typeof raw === 'object' ? raw : {};
			return {
				mode: source.mode === 'px' || source.mode === 'percent' ? source.mode : 'default',
				px: clampInt(source.px, LIMITS.px[0], LIMITS.px[1], DEFAULT_CONFIG.px),
				percent: clampInt(source.percent, LIMITS.percent[0], LIMITS.percent[1], DEFAULT_CONFIG.percent),
			};
		}

		function readStored() {
			try {
				const raw = localStorage.getItem(STORE_KEY);
				return raw === null ? normalize(DEFAULT_CONFIG) : normalize(JSON.parse(raw));
			} catch (error) {
				return normalize(DEFAULT_CONFIG);
			}
		}

		/**
		 * The width override itself.
		 *
		 * The Conversation body publishes `--dsh-chat-content-width` from
		 * `.wSkVaW_body` and both the transcript column and the composer card read
		 * it, so declaring it `!important` on that same element replaces the
		 * draggable preference without touching the component. The percentage form
		 * reads `--dsh-conversation-column-width`, the inline column measurement the
		 * Conversation already publishes, so it follows the window as it resizes.
		 *
		 * @param config - the active preference.
		 * @returns CSS text, empty while the width stays draggable.
		 */
		function widthCss(config) {
			if (config.mode !== 'px' && config.mode !== 'percent') return '';
			const width = config.mode === 'px'
				? config.px + 'px'
				: 'calc(var(--dsh-conversation-column-width, 1100px) * ' + config.percent / 100 + ')';
			return [
				'[data-conversation-content]{--dsh-chat-content-width:' + width + ' !important}',
				'[data-width-handle]{display:none !important}',
			].join('\n');
		}

		/**
		 * The settings row. Markup, spacing and control metrics are copied from the
		 * shipped General preference rows — ui-theme's font-size row for the
		 * stepper and ui-conversation's Composer Enter row for the selector — so the
		 * row reads as one of them. Only the class prefix is ours.
		 */
		const ROW_CSS = [
			'.cw_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}',
			'.cw_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex}',
			'.cw_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}',
			'.cw_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}',
			'.cw_control{align-items:center;gap:8px;display:inline-flex}',
			'.cw_selector{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}',
			'.cw_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}',
			'.cw_chevron{flex:none}',
			'.cw_stepper{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);justify-content:center;align-items:center;height:36px;display:inline-flex;position:relative}',
			'.cw_stepper:focus-within{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
			'.cw_input{box-sizing:border-box;appearance:textfield;-moz-appearance:textfield;border:0;background:0 0;width:72px;height:36px;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;text-align:center;font-variant-numeric:tabular-nums;padding:0 14px;outline:none}',
			'.cw_input::-webkit-outer-spin-button,.cw_input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',
			'.cw_arrows{opacity:0;flex-direction:column;gap:2px;display:flex;position:absolute;right:8px}',
			'.cw_stepper:hover .cw_arrows,.cw_stepper:focus-within .cw_arrows{opacity:1}',
			'.cw_arrow{border-radius:var(--dsw-radius-xs);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);width:17px;height:12px;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;justify-content:center;align-items:center;padding:0;display:inline-flex}',
			'.cw_arrow:hover:not(:disabled){background:var(--dsw-alias-bg-layer-1)}',
			'.cw_arrow:disabled{color:var(--dsw-alias-label-caption);cursor:default}',
			'.cw_arrowGlyph{width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent}',
			'.cw_arrowGlyphUp{border-bottom:5px solid currentColor}',
			'.cw_arrowGlyphDown{border-top:5px solid currentColor}',
			'.cw_unit{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}',
		].join('\n');

		let config = normalize(DEFAULT_CONFIG);
		/** @type {HTMLStyleElement | null} */
		let sheet = null;
		const listeners = new Set();

		/** Persist the preference, re-render the override, and notify every mounted row. */
		function publish(next) {
			config = normalize(next);
			try {
				localStorage.setItem(STORE_KEY, JSON.stringify(config));
			} catch (error) {
				/* A locked-down browser can refuse storage; the width still applies. */
			}
			if (sheet !== null) sheet.textContent = ROW_CSS + '\n' + widthCss(config);
			for (const listener of Array.from(listeners)) listener();
		}

		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}

		/** Read the live preference and re-render this component whenever it changes. */
		function useConfig() {
			const [, bump] = React.useReducer((n) => n + 1, 0);
			React.useEffect(() => subscribe(bump), []);
			return config;
		}

		/**
		 * Resolve the shared primitives on demand: the dropdown and the arrow glyphs
		 * come from the same components the shipped rows use, so the popup is a DSH
		 * menu rather than the browser's unthemed select panel.
		 */
		function primitives() {
			try {
				return require('@deepseek-ai/dsh-client-ui-primitives');
			} catch (error) {
				return null;
			}
		}

		function modeLabel(t, mode) {
			if (mode === 'px') return t('modePx');
			if (mode === 'percent') return t('modePercent');
			return t('modeDefault');
		}

		/** One General settings row: mode selector plus the stepper its mode needs. */
		function WidthRow(props) {
			const t = typeof props.t === 'function' ? props.t : (key) => key;
			const current = useConfig();
			const [menuOpen, setMenuOpen] = React.useState(false);
			const active = current.mode === 'px' ? current.px : current.percent;
			const [draft, setDraft] = React.useState(String(active));
			React.useEffect(() => {
				setDraft(String(active));
			}, [active]);

			const kit = primitives();
			const Menu = kit !== null && typeof kit.Menu === 'function' ? kit.Menu : null;
			const ChevronDown = kit !== null && typeof kit.IconChevronDownOutlineRegular === 'function' ? kit.IconChevronDownOutlineRegular : null;
			const ChevronUp = kit !== null && typeof kit.IconChevronUpOutlineRegular === 'function' ? kit.IconChevronUpOutlineRegular : null;

			const bounds = current.mode === 'percent' ? LIMITS.percent : LIMITS.px;
			const unit = current.mode === 'percent' ? '%' : 'px';

			const commit = () => {
				if (current.mode === 'px') publish({ ...config, px: clampInt(draft, bounds[0], bounds[1], current.px) });
				else if (current.mode === 'percent') publish({ ...config, percent: clampInt(draft, bounds[0], bounds[1], current.percent) });
			};
			/**
		 * Step from the live value, not this render's snapshot, and fold in whatever
		 * is still staged in the field: an arrow press keeps the caret in the input,
		 * so the blur that would commit the draft never happens.
		 */
			const step = (delta) => {
				commit();
				if (current.mode === 'px') publish({ ...config, px: clampInt(config.px + delta, bounds[0], bounds[1], config.px) });
				else if (current.mode === 'percent') publish({ ...config, percent: clampInt(config.percent + delta, bounds[0], bounds[1], config.percent) });
			};

			const selectorRef = React.useRef(null);
			const trigger = h('button', {
				ref: selectorRef,
				type: 'button',
				className: 'cw_selector',
				'aria-haspopup': 'menu',
				'aria-expanded': menuOpen,
				onClick: () => setMenuOpen((open) => !open),
			}, modeLabel(t, current.mode), ChevronDown === null ? null : h(ChevronDown, { className: 'cw_chevron' }));

			const modeControl = Menu === null
				? h('select', {
					className: 'cw_selector',
					value: current.mode,
					'aria-label': t('modeLabel'),
					onChange: (event) => publish({ ...config, mode: event.target.value }),
				}, MODES.map((mode) => h('option', { value: mode, key: mode }, modeLabel(t, mode))))
				: h(Menu, {
					open: menuOpen,
					onClose: () => setMenuOpen(false),
					items: MODES.map((mode) => ({ id: mode, label: modeLabel(t, mode) })),
					selectedId: current.mode,
					onSelect: (id) => {
						/* Return the keyboard before the row publishes, like the shipped rows. */
						if (selectorRef.current !== null) selectorRef.current.focus({ preventScroll: true });
						setMenuOpen(false);
						publish({ ...config, mode: id });
					},
					align: 'end',
					portal: true,
					anchor: trigger,
				});

			const arrowIcon = (direction) => {
				const Icon = direction === 'up' ? ChevronUp : ChevronDown;
				if (Icon !== null) return h(Icon, { size: 9 });
				return h('span', { className: 'cw_arrowGlyph ' + (direction === 'up' ? 'cw_arrowGlyphUp' : 'cw_arrowGlyphDown') });
			};
			/** Keep the caret in the field while stepping, so the draft stays consistent. */
			const keepFocus = (event) => {
				event.preventDefault();
			};

			const stepper = h('div', { className: 'cw_stepper' },
				h('input', {
					className: 'cw_input',
					type: 'number',
					inputMode: 'numeric',
					step: 1,
					min: bounds[0],
					max: bounds[1],
					value: draft,
					'aria-label': t('valueLabel'),
					onChange: (event) => setDraft(event.target.value),
					onBlur: commit,
					onKeyDown: (event) => {
						if (event.key !== 'Enter') return;
						event.preventDefault();
						commit();
					},
				}),
				h('span', { className: 'cw_arrows' },
					h('button', {
						type: 'button',
						className: 'cw_arrow',
						'aria-label': t('increase'),
						disabled: active >= bounds[1],
						onMouseDown: keepFocus,
						onClick: () => step(STEPS[current.mode === 'percent' ? 'percent' : 'px']),
					}, arrowIcon('up')),
					h('button', {
						type: 'button',
						className: 'cw_arrow',
						'aria-label': t('decrease'),
						disabled: active <= bounds[0],
						onMouseDown: keepFocus,
						onClick: () => step(-STEPS[current.mode === 'percent' ? 'percent' : 'px']),
					}, arrowIcon('down'))));

			return h('div', { className: 'cw_row' },
				h('div', { className: 'cw_rowText' },
					h('div', { className: 'cw_title' }, t('title')),
					h('div', { className: 'cw_desc' }, t('description'))),
				h('div', { className: 'cw_control' },
					modeControl,
					current.mode === 'default' ? null : stepper,
					current.mode === 'default' ? null : h('span', { className: 'cw_unit' }, unit)));
		}

		/**
		 * Install the stylesheet, the dictionaries, and the General settings row.
		 * @param ctx - the Client root context.
		 */
		function apply(ctx) {
			config = readStored();
			ctx.effect(() => ctx.locale.register(NS, DICT), 'conversation-width: dictionaries');
			ctx.effect(() => {
				const element = document.createElement('style');
				element.dataset.plugin = NAME;
				element.textContent = ROW_CSS + '\n' + widthCss(config);
				sheet = element;
				document.head.appendChild(element);
				return () => {
					sheet = null;
					element.remove();
				};
			}, 'conversation-width: stylesheet');
			ctx.slots.inject('settings.general.item', () => ctx.slots.register({
				name: 'settings.general.item',
				id: 'conversation-width',
				order: 11.9,
				locale: NS,
			}, WidthRow));
		}

		return { inject: ['slots', 'locale'], apply };
	},
});
