export const Forms = {
	Autocomplete: function(input, list, items_provider, item_drawer, selection_callback, highlight_callback, update_callback) {
		let selection; //currently selected item
		let candidates; //current candidate items

		function destroy_list() {
			list.empty();
			list.style.display = 'none';
			//stop listening keyboard
			//eslint-disable-next-line no-use-before-define
			document.removeEventListener('keydown', manage_keys);
		}

		//close results on a click outside
		document.addEventListener('click', event => {
			if(!list.contains(event.target) && !input.contains(event.target)) {
				destroy_list();
			}
		});

		function unselect_all() {
			selection = undefined;
			list.querySelectorAll('li').forEach(i => i.classList.remove('selected'));
		}

		function manage_selection() {
			destroy_list();
			//replace selection with selected item in the list
			if(selection) {
				input.value = item_drawer(selection).dataset.value;
				if(selection_callback) {
					selection_callback.call(undefined, selection, input.value);
				}
				selection = undefined;
				return true;
			}
			return false;
		}

		/**
		 * @this {HTMLElement}
		 */
		function manage_mouse_over() {
			unselect_all();
			selection = candidates[parseInt(this.dataset['candidateIndex'])];
			this.classList.add('selected');
		}

		/**
		 * @this {HTMLElement}
		 */
		function manage_mouse_out() {
			unselect_all();
			this.classList.remove('selected');
		}

		function manage_keys(event) {
			//enter
			if(event.key === 'Enter') {
				if(manage_selection()) {
					//disable form submission only if a selection has been made through the autocomplete
					event.preventDefault();
				}
				return;
			}
			//escape
			if(event.key === 'Escape') {
				selection = undefined;
				list.style.display = 'none';
				return;
			}
			//down or up
			if(event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				//going down
				if(event.key === 'ArrowDown') {
					//initialize selection on the top candidate
					if(!selection || selection === candidates.last()) {
						selection = candidates[0];
					}
					//normal case, select the next result_nodes
					else {
						selection = candidates[candidates.indexOf(selection) + 1];
					}
				}
				//going up
				else {
					//initialize selection on bottom result_nodes
					if(!selection || selection === candidates.first()) {
						selection = candidates.last();
					}
					//normal case, select the previous result_nodes
					else {
						selection = candidates[candidates.indexOf(selection) - 1];
					}
				}
				//update results list
				const candidate_index = candidates.indexOf(selection);
				list.querySelectorAll('li').forEach(item => {
					if(parseInt(item.dataset['candidateIndex']) === candidate_index) {
						item.classList.add('selected');
					}
					else {
						item.classList.remove('selected');
					}
				});
				if(highlight_callback) {
					highlight_callback.call(undefined, selection);
				}
			}
		}

		/**
		 * @this {HTMLInputElement}
		 */
		function manage_update() {
			const value = this.value;

			if(update_callback) {
				update_callback.call(undefined, value);
			}

			//reset candidates and selection
			candidates = [];
			selection = undefined;

			//destroy existing list
			destroy_list();

			if(value) {
				//ask for matching items and draw them
				candidates = items_provider(value);
				if(candidates.length > 0) {
					candidates.map((candidate, index) => {
						const item_ui = item_drawer(candidate, value);
						//enhance element
						item_ui.dataset.candidateIndex = index;
						item_ui.addEventListener('mouseout', manage_mouse_out);
						item_ui.addEventListener('mouseover', manage_mouse_over);
						item_ui.addEventListener('click', manage_selection);
						//add tab index to make the item ui focusable
						//this is important when used in a "tagger" because "tagger" must be able to detect if the input focus is lost to the autocomplete list
						//this is possible only if autocomplete elements are focusable
						item_ui.setAttribute('tabindex', 0);
						return item_ui;
					}).forEach(Node.prototype.appendChild, list);

					list.style.display = 'block';
					//listen keyboard in order to let user navigate trough results
					document.addEventListener('keydown', manage_keys);
				}
			}
		}

		//add listeners to show search results as user type
		input.addEventListener('input', manage_update);
		//add listener on change to manage search when input content is cut or paste
		//input.addEventListener('change', manage_update);
	}
};
