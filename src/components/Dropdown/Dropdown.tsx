import * as R from 'react';
import cn from 'classnames';

type DropdownItem = {
  id: string;
  name: string;
  [key: string]: any;
};

type Props = {
  items: DropdownItem[],
  selectedItem: DropdownItem,
  isProcessing: boolean,
  onSelectItem?: (itemId: DropdownItem['id']) => void,
  onCreateItem?: (data: { [key: string]: any }) => Promise<void> | void,
  onRemoveItem?: (itemId: DropdownItem['id']) => Promise<void> | void,
};

export const Dropdown: R.FC<Props> = ({
  items,
  selectedItem,
  isProcessing,
  onSelectItem = () => { },
  onCreateItem = () => { },
  onRemoveItem = () => { },
}) => {
  const [isOpen, setIsOpen] = R.useState(false);
  const [isEditing, setIsEditing] = R.useState(false);
  const [value, setValue] = R.useState(selectedItem?.name || 'Select room');
  const inputRef: R.LegacyRef<HTMLInputElement> = R.useRef();

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleRemove = async (itemId: string) => {
    await onRemoveItem(itemId);
  };

  const handleCreate = async () => {
    await onCreateItem({ name: value.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (event: R.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className={`dropdown${isOpen ? ' is-active' : ''}`}>
      <div className="dropdown-trigger is-horizontal">
        <div className="field is-grouped">
          <div className={cn('control', 'm-0', {
            'is-loading': isProcessing,
          })}>
            <input
              type="text"
              className="input"
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreate}
              disabled={isProcessing || !isEditing}
            />
          </div>

          <div className="control">
            {/* <button className="button" onClick={() => handleRemove(selectedItem?.id)}>
              <i className="fas fa-xmark" />
            </button> */}

            <button className="button" onClick={toggleDropdown}>
              <i className={cn("fas fa-angle-down", {
                'is-flap-v': isOpen,
              })} />
            </button>
          </div>
        </div>

        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <div
              className="dropdown-item button is-text"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                  setIsEditing(true);
                  toggleDropdown();
                }
              }}
            >
              Open new room
            </div>
            <hr className="dropdown-divider" />
            {items.map((item) => (
              <div
                key={item.id}
                className={cn('dropdown-item', {
                  'is-active': item.id === selectedItem?.id,
                })}
              >
                <div className="media is-align-items-center">
                  <div
                    className="media-content"
                    onClick={() => {
                      onSelectItem(item.id);
                      setValue(item.name);
                      toggleDropdown();
                    }}
                  >
                    <p>{item.name}</p>
                  </div>

                  {item.id !== selectedItem?.id && (
                    <div className="media-right">
                      <button
                        className="button is-small is-white"
                        onClick={() => handleRemove(item.id)}
                      >
                        <i className="fas fa-xmark" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};