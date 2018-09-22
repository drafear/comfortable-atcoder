class Language {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Switch {
  constructor(onText, offText, storageKey, defaultValue = true) {
    this.onText = onText;
    this.offText = offText;
    this.storageKey = storageKey;
    this.defaultValue = defaultValue;
  }

  readValue() {
    return new Promise(
      resolve => chrome.storage.sync.get(
        [this.storageKey],
        result => {
          resolve(this.storageKey in result ? Boolean(result[this.storageKey]) : this.defaultValue);
        }
      )
    );
  }

  cbChandeListener(e) {
    const value = e.currentTarget.checked;
    const data = {};
    data[this.storageKey] = value;
    chrome.storage.sync.set(data);
  }

  async toElem() {
    const value = await this.readValue();
    const label = document.createElement('label');
    label.classList.add('switch');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = value;
    cb.addEventListener('change', this.cbChandeListener.bind(this));
    label.appendChild(cb);
    const div = document.createElement('div');
    div.dataset.on = this.onText;
    div.dataset.off = this.offText;
    label.appendChild(div);
    return label;
  }
}
class Option {
  constructor(name, component) {
    this.name = name;
    this.component = component;
  }

  async toElem() {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.textContent = this.name;
    const right = document.createElement('div');
    right.appendChild(await this.component.toElem());
    li.appendChild(left);
    li.appendChild(right);
    return li;
  }
}

class Group {
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  async toElem() {
    const div = document.createElement('div');
    const header = document.createElement('h2');
    header.textContent = this.name;
    div.appendChild(header);
    const ul = document.createElement('ul');
    ul.classList.add('settings-list');
    for (const option of this.options) {
      ul.appendChild(await option.toElem());
    }
    div.appendChild(ul);
    return div;
  }
}

function makeWarnOptions(langs) {
  // Bash, Text
  const defaults = new Set(['3001', '3027']);
  const options = [];
  for (const lang of langs) {
    const defaultValue = Boolean(defaults.has(lang.id));
    options.push(
      new Option(
        lang.name,
        new Switch('on', 'off', `warn-${lang.id}`, defaultValue)
      )
    );
  }
  return options;
}

const languages = [
  new Language('3003', 'C++14 (GCC)'),
  new Language('3001', 'Bash'),
  new Language('3002', 'C (GCC)'),
  new Language('3004', 'C (Clang)'),
  new Language('3005', 'C++14 (Clang)'),
  new Language('3006', 'C#'),
  new Language('3007', 'Clojure'),
  new Language('3008', 'Common Lisp'),
  new Language('3009', 'D (DMD64)'),
  new Language('3010', 'D (LDC)'),
  new Language('3011', 'D (GDC)'),
  new Language('3012', 'Fortran'),
  new Language('3013', 'Go'),
  new Language('3014', 'Haskell'),
  new Language('3015', 'Java7'),
  new Language('3016', 'Java8'),
  new Language('3017', 'JavaScript'),
  new Language('3018', 'OCaml'),
  new Language('3019', 'Pascal'),
  new Language('3020', 'Perl'),
  new Language('3021', 'PHP'),
  new Language('3022', 'Python2'),
  new Language('3023', 'Python3'),
  new Language('3024', 'Ruby'),
  new Language('3025', 'Scala'),
  new Language('3026', 'Scheme'),
  new Language('3027', 'Text'),
  new Language('3028', 'Visual Basic'),
  new Language('3029', 'C++ (GCC)'),
  new Language('3030', 'C++ (Clang)'),
  new Language('3501', 'Objective-C (GCC)'),
  new Language('3502', 'Objective-C (Clang)'),
  new Language('3503', 'Swift'),
  new Language('3504', 'Rust'),
  new Language('3505', 'Sed'),
  new Language('3506', 'Awk'),
  new Language('3507', 'Brainfuck'),
  new Language('3508', 'Standard ML'),
  new Language('3509', 'PyPy2'),
  new Language('3510', 'PyPy3'),
  new Language('3511', 'Crystal'),
  new Language('3512', 'F#'),
  new Language('3513', 'Unlambda'),
  new Language('3514', 'Lua'),
  new Language('3515', 'LuaJIT'),
  new Language('3516', 'MoonScript'),
  new Language('3517', 'Ceylon'),
  new Language('3518', 'Julia'),
  new Language('3519', 'Octave'),
  new Language('3520', 'Nim'),
  new Language('3521', 'TypeScript'),
  new Language('3522', 'Perl6'),
  new Language('3523', 'Kotlin'),
  new Language('3524', 'PHP7'),
  new Language('3525', 'COBOL - Fixed'),
  new Language('3526', 'COBOL - Free'),
];

const groups = [
  new Group(
    'Non-beta',
    [
      new Option(
        'Beta Tab',
        new Switch('enable', 'disable', 'dnd-html'),
      ),
    ],
  ),
  new Group(
    'Notification',
    [
      new Option(
        'Judge Result',
        new Switch('on', 'off', 'notify-judge-result'),
      ),
      new Option(
        'Clarification',
        new Switch('on', 'off', 'notify-clarification'),
      ),
    ],
  ),
  new Group(
    'Dropdown',
    [
      new Option(
        'Hover',
        new Switch('hover', 'click', 'dropdown-hover'),
      ),
      new Option(
        'Problem Tab',
        new Switch('enable', 'disable', 'dropdown-problem'),
      ),
    ],
  ),
  new Group(
    'Edit',
    [
      new Option(

        'D & D .html',
        new Switch('enable', 'disable', 'dnd-html'),
      ),
    ],
  ),
  new Group(
    'Warning on Submission',
    makeWarnOptions(languages),
  ),
];

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.documentElement;
  for (const group of groups) {
    root.appendChild(await group.toElem());
  }
});
