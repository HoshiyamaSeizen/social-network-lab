$(() => {
	$('#accordion').accordion({ header: 'h3', collapsible: true, active: false });
	$('#dialog').dialog({
		modal: true,
		autoOpen: false,
		resizable: false,
		show: {
			effect: 'blind',
			duration: 200,
		},
		hide: {
			effect: 'explode',
			duration: 300,
		},
	});

	$('#search-btn').on('click', (e) => {
		e.preventDefault();

		const val = $('.search-bar input').val();

		if (val.length) {
			$('.ui-accordion-header')
				.hide()
				.next()
				.hide()
				.filter((i) => {
					return (
						$('.ui-accordion-header')
							.eq(i)
							.text()
							.toLocaleLowerCase()
							.indexOf(val.toLocaleLowerCase()) > -1
					);
				})
				.prev()
				.show();
		} else {
			$('.ui-accordion-header').show();
		}
	});

	$('.open-edit-btn').on('click', (e) => {
		e.preventDefault();
		const btn = $(e.currentTarget);
		const id = btn.attr('user_id');
		const info = btn
			.parent()
			.prev()
			.children()
			.children('span')
			.toArray()
			.map((el) => el.outerText);
		info.push(btn.parent().parent().prev().text());
		$('#dialog').attr('user_id', id).dialog('open');
		$('#user_id').text(id);
		$('#name').attr('value', info[4]);
		$('#email').attr('value', info[0]);
		$('#date').attr('value', info[1]);
		$('#role').val(['user', 'moderator', 'admin'].indexOf(info[2]) + 1);
		$('#status').val(['active', 'blocked'].indexOf(info[3]) + 1);
		$('#dialog').children('form').attr('action', `/users/${id}`);
	});

	$('.block-btn.post-block').on('click', (e) => {
		const btn = $(e.currentTarget);
		const id = btn.attr('post_id');
		$.post(`/posts/${id}`, (active) => {
			btn.attr('active', active)
				.children('span')
				.text(active ? 'Active' : 'Blocked');
			btn.children('i')
				.removeClass(active ? 'fa-lock' : 'fa-unlock')
				.addClass(active ? 'fa-unlock' : 'fa-lock');
		});
	});

	$('img').on('click', (e) => {
		const img = $(e.currentTarget);
		const active = img.attr('active');
		const btn = $('#dialog')
			.dialog('option', 'width', '70vw')
			.dialog('option', 'position', { my: 'top', at: 'top', of: window })
			.dialog('open')
			.children('button')
			.attr('image_id', img.attr('image_id'));
		btn.attr('active', active)
			.children('span')
			.text(active === 'true' ? 'Active' : 'Blocked');
		btn.children('i')
			.removeClass(active ? 'fa-lock' : 'fa-unlock')
			.addClass(active ? 'fa-unlock' : 'fa-lock');
		$('.image').children().attr('src', img.attr('src'));
	});

	$('.block-btn.image-block').on('click', (e) => {
		const btn = $(e.currentTarget);
		const id = btn.attr('image_id');
		$.post(`/images/${id}`, (active) => {
			btn.attr('active', active)
				.children('span')
				.text(active ? 'Active' : 'Blocked');
			btn.children('i')
				.removeClass(active ? 'fa-lock' : 'fa-unlock')
				.addClass(active ? 'fa-unlock' : 'fa-lock');
		});
	});
});
