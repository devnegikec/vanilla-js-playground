function ObjectGroupBy(items, callback) {

	const result = {};

	const key = callback(items[0]);

	for (let item of items) {
		if(item[key]) {
			if (result[key]) {
				reslut[key].push(item);
			} else {
				reslut[key] = [item];
			}
		}
	}

	return result;

}

const items = [
  {
    id: 1,
    kind: 'a',
  },
  {
    id: 2,
    kind: 'b',
  },
  {
    id: 3,
    kind: 'a',
  }
]


var d = ObjectGroupBy(items, ({kind}) => kind);

console.log("d:-", d);


const replacer = (key,val) => typeof val === 'undefined' ? null : val;
const undefinedToNull = (arg) => JSON.parse(JSON.stringify(arg,replacer));