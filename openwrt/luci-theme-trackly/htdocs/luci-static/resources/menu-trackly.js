'use strict';
'require baseclass';
'require ui';

/* Menu and tab traversal follows LuCI Bootstrap (Apache-2.0).
 * The menu tree is supplied by LuCI, including its existing ACL filtering. */
return baseclass.extend({
	__init__: function() {
		this.bindDrawer();
		ui.menu.load().then(L.bind(this.render, this)).catch(function(error) {
			ui.addNotification(null, E('p', {}, error.message), 'error');
		});
	},

	bindDrawer: function() {
		var toggle = document.getElementById('trackly-menu-toggle');
		var sidebar = document.getElementById('trackly-sidebar');
		var scrim = document.getElementById('trackly-scrim');
		var mobile = window.matchMedia('(max-width: 760px)');
		this.setDrawer = function(open) {
			document.body.classList.toggle('trackly-menu-open', open);
			toggle.setAttribute('aria-expanded', String(open));
			scrim.hidden = !open;
			sidebar.inert = mobile.matches && !open;
			if (open) {
				var first = sidebar.querySelector('summary, a');
				if (first) first.focus();
			}
		};
		toggle.addEventListener('click', L.bind(function() {
			this.setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
		}, this));
		scrim.addEventListener('click', L.bind(function() {
			this.setDrawer(false);
			toggle.focus();
		}, this));
		document.addEventListener('keydown', L.bind(function(event) {
			if (toggle.getAttribute('aria-expanded') !== 'true') return;
			if (event.key === 'Escape') {
				this.setDrawer(false);
				toggle.focus();
			}
			if (event.key === 'Tab') {
				var items = Array.from(sidebar.querySelectorAll('a, summary'))
					.filter(function(item) { return item.getClientRects().length > 0; });
				var first = items[0], last = items[items.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last.focus();
				}
				else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		}, this));
		mobile.addEventListener('change', L.bind(function() { this.setDrawer(false); }, this));
		this.setDrawer(false);
	},

	render: function(tree) {
		var roots = ui.menu.getChildren(tree);
		var modes = document.getElementById('modemenu');
		for (var i = 0; i < roots.length; i++) {
			var active = L.env.requestpath.length ? roots[i].name === L.env.requestpath[0] : i === 0;
			modes.appendChild(E('li', {}, E('a', {
				'href': L.url(roots[i].name),
				'aria-current': active ? 'page' : null
			}, _(roots[i].title))));
			if (active) this.renderSidebar(roots[i]);
		}
		if (roots.length > 1) modes.style.display = '';
		var node = tree, path = [];
		for (var level = 0; level < 3 && node; level++) {
			var name = L.env.dispatchpath[level];
			node = node.children && node.children[name];
			path.push(name);
		}
		if (node) this.renderTabMenu(node, path.join('/'), 0);
	},

	renderSidebar: function(root) {
		var container = document.getElementById('trackly-menu');
		var groups = ui.menu.getChildren(root);
		var context = document.getElementById('trackly-context');
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			var children = ui.menu.getChildren(group);
			var active = L.env.dispatchpath[1] === group.name;
			var groupURL = L.url(root.name, group.name);
			if (!children.length) {
				container.appendChild(E('a', { 'class': 'trackly-menu-leaf', 'href': groupURL, 'aria-current': active ? 'page' : null }, _(group.title)));
				if (active) context.replaceChildren(E('strong', {}, _(group.title)));
				continue;
			}
			var list = E('ul', { 'class': 'trackly-menu-items' });
			for (var j = 0; j < children.length; j++) {
				var child = children[j];
				var selected = active && L.env.dispatchpath[2] === child.name;
				list.appendChild(E('li', {}, E('a', {
					'href': L.url(root.name, group.name, child.name),
					'aria-current': selected ? 'page' : null
				}, _(child.title))));
				if (selected) context.replaceChildren(
					E('span', {}, _(group.title)), E('span', { 'aria-hidden': 'true' }, '/'), E('strong', {}, _(child.title))
				);
			}
			container.appendChild(E('details', { 'class': 'trackly-menu-group', 'open': active ? '' : null }, [
				E('summary', {}, _(group.title)), list
			]));
		}
	},

	renderTabMenu: function(tree, url, level) {
		var container = document.getElementById('tabmenu');
		var children = ui.menu.getChildren(tree);
		var list = E('ul', { 'class': 'tabs' });
		var active;
		for (var i = 0; i < children.length; i++) {
			var selected = L.env.dispatchpath[3 + level] === children[i].name;
			list.appendChild(E('li', { 'class': selected ? 'active' : null }, E('a', {
				'href': L.url(url, children[i].name),
				'aria-current': selected ? 'page' : null
			}, _(children[i].title))));
			if (selected) active = children[i];
		}
		if (!children.length) return;
		container.appendChild(list);
		container.style.display = '';
		if (active) this.renderTabMenu(active, url + '/' + active.name, level + 1);
	}
});
